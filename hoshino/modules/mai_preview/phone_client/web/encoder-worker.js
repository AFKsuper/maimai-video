/* 手机端离线编码 Worker —— 让「谱面渲染 + 60fps 编码」脱离页面前台。
 *
 * 背景：主线程里的编码只要页面一进后台就被 Chrome 节流。实测同一台机器、
 * 同一份谱面，主线程编码在页面 hidden 后精确冻结在第 5431 帧，encodeQueueSize
 * 恒定停在 33/35/4 不再变化；而把同样的活儿放进 Worker，页面全程 hidden
 * 仍然跑完 9000 帧（720px，35.5 秒，约实时 4.2 倍），心跳间隔平均 118ms，
 * 完全看不到节流迹象。所以「编码不必留在前台」这件事是靠 Worker 挣来的，
 * 不是靠静音音频那类保活技巧。
 *
 * 代价：render-bundle.js 是为网页写的，需要一个极薄的 DOM 垫片。它真正用到的
 * 只有三样东西 —— document.getElementById("canvas")、document.createElement("canvas")
 * （9 处，全是离屏 sprite/暂存画布）、以及 canvas.parentElement.getBoundingClientRect()
 * （仅 resize() 用，且本身有 null 判断，Worker 里退化成 no-op 也无妨）。
 * 另外它用相对路径 fetch("./charts/<id>.txt")，在 Worker 里会按本文件所在目录解析，
 * 恰好也是服务根目录，所以无需额外改写。
 *
 * 入参走本文件自身的 URL query（与旧版 encoder.html 的参数名保持一致，
 * 服务器改配置即可生效）：
 *   id diff           曲目 id 与难度槽位（bundle 靠这两个参数取谱面）
 *   px / size        画布边长，px 优先，size 兼容旧写法
 *   fps bitrate      编码参数
 *   dur              只编前 N 秒（0 或缺省 = 全曲）
 *   flush            每多少帧 flush 一次（背压用，默认 = fps）
 *   ui               进度上报间隔（帧，默认 fps/2）
 *   save             手机本地落盘服务地址（默认 http://127.0.0.1:8780/save）
 *                    成品**直接写进手机存储**，一个字节都不出手机。
 *                    传 save=0 或 save=off 可以关掉（只编码不落盘）。
 *   notify           服务器通知地址（含 token）。手机存好之后才告诉服务器
 *                    「这支有了」，服务器只记一条索引，不保存视频本体。
 *   name             落盘文件名，形如 <曲id>_<难度>[_曲名].mp4
 *   bundle           可选，直接指定交给 bundle 的 query；不给就按上面几个参数拼
 *
 * 进度通过 postMessage 上报，字段与旧版 encoder.html 的 window.__encoderState 对齐。
 */
'use strict';

const Q = new URLSearchParams(self.location.search);

function qnum(keys, dflt, min, max) {
  for (const k of keys) {
    const raw = Q.get(k);
    if (raw === null || raw === '') continue;
    const n = Number(raw);
    if (!isFinite(n)) continue;
    let v = Math.round(n);
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    return v;
  }
  return dflt;
}

const PX = qnum(['px', 'size'], 720, 200);
const FPS = qnum(['fps'], 60, 1, 120);
const BITRATE = qnum(['bitrate'], 4e6, 200e3);
const FLUSH_EVERY = qnum(['flush'], FPS, 1);
const UI_EVERY = qnum(['ui'], Math.max(1, Math.round(FPS / 2)), 1);
const DUR_S = Number(Q.get('dur')) > 0 ? Number(Q.get('dur')) : 0;
// 手机本地落盘服务。默认开，只有显式传 save=0/off/false 才关。
// 走 127.0.0.1，不经过 WiFi、不经过服务器 —— 成品直接躺在手机存储里。
const SAVE_RAW = (Q.get('save') || '').trim().toLowerCase();
const SAVE_URL = (SAVE_RAW === '0' || SAVE_RAW === 'off' || SAVE_RAW === 'false' || SAVE_RAW === 'no')
  ? ''
  : (SAVE_RAW && SAVE_RAW !== '1' && SAVE_RAW !== 'on' && SAVE_RAW !== 'true' && SAVE_RAW !== 'yes'
      ? Q.get('save')                      // 传的是完整地址，直接用
      : 'http://127.0.0.1:8780/save');
// 通知服务器：只上报「这支已经在手机上了」，不带视频字节。
const NOTIFY_URL = Q.get('notify') || '';
const WANT_NAME = Q.get('name') || '';
const CHART_ID = Q.get('id') || '';
const CHART_DIFF = Q.get('diff') || '';
// bundle 用的 query：优先用服务器显式给的 bundle，否则自己按参数拼。
// 这两个参数就是 render-bundle.js 唯一的输入面（谱面 id、难度槽位、画布尺寸、HUD 开关）。
const BUNDLE_QS = Q.get('bundle') || ('?' + new URLSearchParams({
  id: String(CHART_ID),
  diff: String(CHART_DIFF),
  size: String(PX),
  dpr: '1',            // 画布尺寸由 setSize 钉死，别让 DPR 把像素面积放大 6 倍
  hud: '0',
  autoplay: '0',
  hiSpeed: '6',
  mirror: '0',
  speed: '1',
}).toString());

const state = {
  phase: 'boot', frames: 0, totalFrames: 0, bytes: 0,
  encodeMs: 0, renderMs: 0, error: null, finished: false,
  chartId: null, diff: null, px: PX, fps: FPS, bitrate: BITRATE,
  chunkCount: 0, save: null, upload: null, name: WANT_NAME, inWorker: true,
};

function post(extra) {
  try {
    self.postMessage(Object.assign({ type: 'state' }, state, extra || {}));
  } catch (e) { /* 结构化克隆失败不外抛 */ }
}

function setPhase(p) { state.phase = p; post(); }

self.onerror = (msg) => {
  state.error = 'workerOnError: ' + msg;
  setPhase('error');
};
self.onunhandledrejection = (e) => {
  state.error = 'workerUnhandledRejection: ' + ((e && e.reason && (e.reason.stack || e.reason.message)) || e);
  setPhase('error');
};

/* ------------------------------------------------------------------ *
 * DOM 垫片
 * ------------------------------------------------------------------ */
const fakeRect = () => ({ width: PX, height: PX, top: 0, left: 0, right: PX, bottom: PX, x: 0, y: 0 });

function makeCanvasEl(w, h) {
  const c = new OffscreenCanvas(Math.max(1, (w | 0) || 1), Math.max(1, (h | 0) || 1));
  // bundle 的 resize() 会读 parentElement.getBoundingClientRect()；给个固定正方形尺寸，
  // 免得它按 0 尺寸缩放画布。父元素本身在 Worker 里不存在，这正是我们要的。
  c.parentElement = { getBoundingClientRect: fakeRect, clientWidth: PX, clientHeight: PX };
  c.style = {};
  c.getBoundingClientRect = fakeRect;
  return c;
}

const mainCanvas = makeCanvasEl(PX, PX);

const documentShim = {
  visibilityState: 'hidden',           // 我们本来就打算在后台跑，直接告诉 bundle 真相
  getElementById(id) {
    // bundle 只找 canvas；HUD 那几个元素找不到也没关系，它有 null 判断
    return id === 'canvas' ? mainCanvas : null;
  },
  createElement(tag) {
    if (tag === 'canvas' || tag === 'CANVAS') return makeCanvasEl(1, 1);
    return { style: {}, appendChild() {}, setAttribute() {}, addEventListener() {} };
  },
  addEventListener() {},
  removeEventListener() {},
  querySelector() { return null; },
  body: { appendChild() {} },
};

const raf = (cb) => setTimeout(() => cb(performance.now()), 16);

const windowShim = {
  location: { search: BUNDLE_QS, href: '/encoder-worker.js' + BUNDLE_QS },
  devicePixelRatio: 1,
  addEventListener() {}, removeEventListener() {},
  document: documentShim,
  performance,
  requestAnimationFrame: raf,
  cancelAnimationFrame: clearTimeout,
  setTimeout, clearTimeout, setInterval, clearInterval,
  URL, URLSearchParams, fetch, Blob, TextDecoder,
  // bundle 里唯一一处 new Image()：传感器贴图。OffscreenCanvas 能被 drawImage 接受，
  // 当作「没加载出来的图」用即可（和真实场景里贴图未就绪的表现一致）。
  Image: function Image() { return makeCanvasEl(1, 1); },
};
windowShim.window = windowShim;
windowShim.self = self;

self.window = windowShim;
self.document = documentShim;
self.requestAnimationFrame = raf;
self.cancelAnimationFrame = clearTimeout;
self.Image = windowShim.Image;
// 注意：不要写 self.location / self.devicePixelRatio / self.performance 之类的东西。
// WorkerGlobalScope 上它们要么只读（location 只有 getter，赋值直接抛
// "Cannot set property location of #<WorkerGlobalScope> which has only a getter"，
// 会让整个 Worker 在启动瞬间就死掉），要么本来就存在。bundle 读的是 window.location，
// 我们已经在 windowShim 上备好了。
// 说明：这里刻意不改写 fetch。本文件位于服务根目录，bundle 的相对路径
// "./charts/<id>.txt" 会按本文件 URL 解析成 "/charts/<id>.txt"，正是要的地址。

/* ------------------------------------------------------------------ *
 * 加载渲染引擎
 * ------------------------------------------------------------------ */
try {
  importScripts('./render-bundle.js');
} catch (e) {
  state.error = '渲染引擎加载失败：' + (e && (e.stack || e.message) || e);
  setPhase('error');
}

/* ------------------------------------------------------------------ *
 * 编码主流程
 * ------------------------------------------------------------------ */
function pickConfig() {
  return {
    codec: 'avc1.640028',                 // H.264 High 4.0
    width: PX, height: PX,
    bitrate: BITRATE, framerate: FPS,
    hardwareAcceleration: 'prefer-hardware',
    latencyMode: 'quality',
  };
}

async function pickSupportedConfig() {
  const primary = pickConfig();
  let sup = await VideoEncoder.isConfigSupported(primary);
  if (sup.supported) return sup.config;
  post({ note: '主配置不支持，降级 avc1.4D401F' });
  const mid = Object.assign({}, primary, { codec: 'avc1.4D401F', hardwareAcceleration: 'no-preference' });
  sup = await VideoEncoder.isConfigSupported(mid);
  if (sup.supported) return sup.config;
  post({ note: '再降级 avc1.42E01E' });
  const low = Object.assign({}, mid, { codec: 'avc1.42E01E' });
  sup = await VideoEncoder.isConfigSupported(low);
  if (sup.supported) return sup.config;
  throw new Error('本机不支持任何可用的 H.264 编码配置');
}

async function run() {
  if (typeof OffscreenCanvas !== 'function') throw new Error('本机不支持 OffscreenCanvas');
  if (typeof VideoEncoder !== 'function') {
    throw new Error('VideoEncoder 不可用：页面必须处于安全上下文（https 或 127.0.0.1）');
  }

  setPhase('waiting-engine');
  const t0 = performance.now();
  let api = windowShim.__chartPreview;
  while ((!api || !api.ready) && performance.now() - t0 < 30000) {
    await new Promise((r) => setTimeout(r, 60));
    api = windowShim.__chartPreview;
  }
  if (!api || !api.ready) throw new Error('等待渲染引擎就绪超时');

  const info = await api.ready;
  state.chartId = info.chartId;
  state.diff = info.diff;
  const size = (typeof api.setSize === 'function') ? api.setSize(PX, 1) : { width: PX, height: PX };
  post({ note: `谱面就绪 id=${info.chartId} diff=${info.diff} bpm=${info.bpm} 画布 ${size.width}×${size.height}` });

  const cfg = await pickSupportedConfig();
  post({ note: `编码配置 ${cfg.codec} ${cfg.width}×${cfg.height} @${cfg.framerate}fps ${(cfg.bitrate / 1e6).toFixed(1)}Mbps` });

  const mod = await import('./vendor_mp4_muxer.mjs');
  const muxer = new mod.Muxer({
    target: new mod.ArrayBufferTarget(),
    video: { codec: 'avc', width: PX, height: PX, frameRate: FPS },
    fastStart: 'in-memory',
  });

  let encErr = null;
  let chunkCount = 0;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      try { muxer.addVideoChunk(chunk, meta); chunkCount++; state.chunkCount = chunkCount; }
      catch (e) { encErr = encErr || e; }
    },
    error: (e) => { encErr = encErr || e; },
  });
  encoder.configure(cfg);

  const totalMs = DUR_S > 0 ? Math.min(DUR_S * 1000, info.totalMs) : info.totalMs;
  const totalFrames = Math.max(2, Math.ceil(totalMs / 1000 * FPS));
  state.totalFrames = totalFrames;
  state.name = WANT_NAME || `${info.chartId}_${info.diff}.mp4`;
  setPhase('encoding');

  const tEnc = performance.now();
  let renderAcc = 0, encodeAcc = 0, nextTick = 0;
  const UI_EVERY = Math.max(1, Math.round(FPS / 2));

  for (let i = 0; i < totalFrames; i++) {
    if (encErr) throw encErr;

    const tr = performance.now();
    api.renderMs(i * 1000 / FPS);
    renderAcc += performance.now() - tr;

    const te = performance.now();
    const frame = new VideoFrame(mainCanvas, {
      timestamp: Math.round(i * 1e6 / FPS),
      duration: Math.round(1e6 / FPS),
    });
    encoder.encode(frame, { keyFrame: i % (FPS * 2) === 0 });
    frame.close();
    encodeAcc += performance.now() - te;

    // 背压：定期把编码队列吐空。flush 由编码线程驱动，页面级 timer 节流影响不到它。
    if ((i + 1) % FLUSH_EVERY === 0) {
      await encoder.flush();
      if (encErr) throw encErr;
    }

    const done = i + 1;
    if (done >= nextTick || done === totalFrames) {
      nextTick = done + UI_EVERY;
      state.frames = done;
      state.renderMs = renderAcc;
      state.encodeMs = encodeAcc;
      post();
    }
  }

  setPhase('flushing');
  await encoder.flush();
  encoder.close();
  if (encErr) throw encErr;

  const tm = performance.now();
  muxer.finalize();
  const buffer = muxer.target.buffer;
  state.bytes = buffer.byteLength;
  state.renderMs = renderAcc;
  state.encodeMs = encodeAcc;
  state.muxMs = performance.now() - tm;
  state.wallMs = performance.now() - tEnc;
  post({ note: `编码完成 ${totalFrames} 帧 / ${(buffer.byteLength / 1048576).toFixed(2)} MB，耗时 ${(state.wallMs / 1000).toFixed(1)}s` });

  if (!SAVE_URL) {
    setPhase('done');
    return;
  }

  // 落盘这一步交给主线程做，Worker 只把字节递出去。
  //
  // 为什么不在 Worker 里直接 fetch：Worker 里做跨源 POST 到 127.0.0.1:8780，
  // 既触发 CORS 预检，又可能踩到 Chrome 对 localhost 混合内容的限制，
  // 实测报的就是一句没头没脑的 "Failed to fetch"。主线程和页面同源，
  // 走的是同一条已验证可用的路。
  setPhase('handoff');
  const saveName = state.name || `${info.chartId}_${info.diff}.mp4`;
  try {
    self.postMessage({
      type: 'blob',
      buffer,
      name: saveName,
      chartId: String(info.chartId),
      diff: Number(info.diff),
    }, [buffer]);
  } catch (e) {
    state.save = { ok: false, error: String(e && e.message || e) };
    post({ note: `交给页面落盘失败：${state.save.error}` });
    setPhase('done');
  }
  return;
}

run().catch((e) => {
  state.error = String(e && (e.stack || e.message) || e);
  setPhase('error');
});
