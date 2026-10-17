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
// 音轨码率。音轨是主线程解码好、把 PCM 递进来的（Worker 里没有 AudioContext，
// 解不了 mp3），这里只负责把 PCM 编成 AAC 塞进同一个 MP4。
const AUDIO_BITRATE = qnum(['abitrate'], 128000, 32e3);
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
 * 音轨：向主线程要 PCM
 * ------------------------------------------------------------------ */

/* 为什么要绕主线程：AudioContext / decodeAudioData 在 Worker 作用域里不存在
 * （实测 Worker 里 hasAudioContext=false、hasOfflineAC=false），而 AudioDecoder
 * 只能解裸 AAC/Opus 帧，解不了 mp3 容器。主线程两样都有，所以由它把
 * track.mp3 解码成 PCM，再把 Float32 采样递进来，这边只做 PCM→AAC 编码。
 *
 * 拿不到音轨不是错误：成片退化成无声，其余流程照常。 */
let audioWaiter = null;
let audioReqId = 0;

function requestAudio() {
  const wantSec = (DUR_S > 0 ? DUR_S : 0);
  return new Promise((resolve) => {
    const id = ++audioReqId;
    let done = false;
    const finish = (v) => {
      if (done) return;
      done = true;
      if (audioWaiter && audioWaiter.id === id) audioWaiter = null;
      resolve(v);
    };
    audioWaiter = { id, finish };
    self.postMessage({ type: 'need-audio', reqId: id, chartId: CHART_ID, wantSec });
    // 主线程要下载 + 解码，20 秒还不回来就当没有音轨
    setTimeout(() => finish(null), 20000);
  });
}

// 主线程把解码好的 PCM 递回来
self.addEventListener('message', (ev) => {
  const m = ev.data || {};
  if (m.type !== 'audio' || !audioWaiter || m.reqId !== audioWaiter.id) return;
  if (!m.ok || !m.channels || !m.channels.length) {
    if (m.error) post({ note: '音轨解码失败：' + m.error });
    audioWaiter.finish(null);
    return;
  }
  audioWaiter.finish({
    sampleRate: m.sampleRate,
    numberOfChannels: m.numberOfChannels,
    durationMs: m.durationMs,
    channels: m.channels,     // Float32Array[]，从主线程转移过来
  });
});

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

  // 音轨：PCM 由主线程解码后递过来（见 worker.html 的 decodeAudio）。
  // 拿不到就退化成无声成片 —— 绝不因为音频让整支渲染失败。
  let audioPcm = null;
  try {
    audioPcm = await requestAudio();
  } catch (e) {
    post({ note: '音轨准备失败（成片将无声）：' + ((e && e.message) || e) });
  }
  if (audioPcm) {
    post({ note: `音轨就绪 ${audioPcm.sampleRate}Hz ${audioPcm.numberOfChannels}ch ` +
                 `${(audioPcm.durationMs / 1000).toFixed(1)}s` });
  }

  const totalMs = DUR_S > 0 ? Math.min(DUR_S * 1000, info.totalMs) : info.totalMs;

  // 先把音轨整段编成 AAC 帧收在手里，再决定 muxer 要不要声明 audio 轨。
  //
  // 为什么必须先编完才知道：muxer 一旦在构造时声明了 audio，finalize 就会
  // 去收尾这条轨；而 `_finalizeCurrentChunk` 依赖 `lastSample`，一条只有声明
  // 没有任何样本的轨会让它炸掉或写出坏 moov。所以「有没有音频」必须在建
  // muxer 之前就是确定的事实，不能靠后面再补。
  const audioChunks = [];
  if (audioPcm) {
    setPhase('encoding-audio');
    let aerr = null;
    const aenc = new AudioEncoder({
      output: (chunk) => { audioChunks.push(chunk); },
      error: (e) => { aerr = aerr || e; },
    });
    try {
      aenc.configure({
        codec: 'mp4a.40.2',
        sampleRate: audioPcm.sampleRate,
        numberOfChannels: audioPcm.numberOfChannels,
        bitrate: AUDIO_BITRATE,
      });
      const sr = audioPcm.sampleRate;
      const nch = audioPcm.numberOfChannels;
      const totalSamples = audioPcm.channels[0].length;
      // 音轨只要覆到画面结束就够，多出来的截掉，免得容器被拉长
      const needSamples = Math.min(totalSamples, Math.ceil(totalMs / 1000 * sr));
      const FRAME = 1024;                       // AAC 帧长固定 1024 采样
      for (let off = 0; off < needSamples; off += FRAME) {
        if (aerr) throw aerr;
        const n = Math.min(FRAME, needSamples - off);
        const buf = new Float32Array(n * nch);  // 交错布局
        for (let c = 0; c < nch; c++) {
          const src = audioPcm.channels[c];
          for (let i = 0; i < n; i++) buf[i * nch + c] = src[off + i] || 0;
        }
        const ad = new AudioData({
          format: 'f32',
          sampleRate: sr,
          numberOfFrames: n,
          numberOfChannels: nch,
          timestamp: Math.round(off / sr * 1e6),   // 微秒
          data: buf,
        });
        aenc.encode(ad);
        ad.close();
        // 背压：别把几千帧全堆在编码队列里
        if (aenc.encodeQueueSize > 64) await aenc.flush();
      }
      await aenc.flush();
      aenc.close();
      if (aerr) throw aerr;
      post({ note: `音轨已编 ${audioChunks.length} 帧` });
    } catch (e) {
      try { aenc.close(); } catch (e2) { /* ignore */ }
      // 半截音轨宁可整段丢掉，让成片干净地无言，再由服务器兜底补轨
      for (const c of audioChunks) { try { c.close(); } catch (e3) { /* ignore */ } }
      audioChunks.length = 0;
      audioPcm = null;
      post({ note: '音轨编码失败（成片将无声，服务器可兜底补轨）：' + ((e && e.message) || e) });
    }
  }

  const muxerOpt = {
    target: new mod.ArrayBufferTarget(),
    video: { codec: 'avc', width: PX, height: PX, frameRate: FPS },
    fastStart: 'in-memory',
  };
  // audio 段必须在任何 addAudioChunk 之前声明，否则 muxer 抛 "No audio track declared."
  if (audioChunks.length) {
    muxerOpt.audio = {
      codec: 'aac',
      numberOfChannels: audioPcm.numberOfChannels,
      sampleRate: audioPcm.sampleRate,
    };
  }
  const muxer = new mod.Muxer(muxerOpt);

  // 音频先塞进去（时间轴按各自轨道独立，先后不影响正确性）
  if (audioChunks.length) {
    try {
      for (let k = 0; k < audioChunks.length; k++) {
        const ch = audioChunks[k];
        muxer.addAudioChunk(ch);
        // 不是所有实现都给得出 close()，缺了也不能让整支片子哑掉
        if (ch && typeof ch.close === 'function') {
          try { ch.close(); } catch (e4) { /* ignore */ }
        }
      }
      post({ note: `音轨已写入 ${audioChunks.length} 帧` });
      audioChunks.length = 0;
    } catch (e) {
      post({ note: '音轨写入失败（成片将无声）：' + ((e && e.message) || e) });
      for (const ch of audioChunks) {
        if (ch && typeof ch.close === 'function') { try { ch.close(); } catch (e5) { /* ignore */ } }
      }
      audioChunks.length = 0;
    }
  }

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
