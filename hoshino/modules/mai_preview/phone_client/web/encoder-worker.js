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
 * 开头空场期的提示层
 * ------------------------------------------------------------------ *
 * 为什么需要它：谱面第一个音符出现之前，画面上只有判定圈，静止不动。
 * 音乐前奏有 3 秒还好，遇到 12 秒才出第一颗的曲子，观众看到的就是
 * 十几秒一张静图 —— 在群里就表现为「视频卡住了 / 有延迟」。
 * 实测 110734_7 前 10.62 秒完全无变化（dead_time.py）。
 *
 * 做法：把「音乐已经响起、谱面还没开始」这段时间显式画出来 —— 曲名、
 * 难度、前奏进度条。它不改变谱面渲染，只是在帧循环里叠一层，
 * 一到第一个音符进场就淡出。 */

// 音符在命中前多久出现。render-bundle.js:3 BASE_APPROACH_TIME_MS = 2250，
// :86 HI_SPEED_CONVERSION_FACTOR = 2/3*0.9，:85 HI_SPEED_DEFAULT = 6，
// 有效流速 6*0.6 = 3.6，进场时长 = 2250/3.6 = 625ms。
// worker 从不改流速（BUNDLE_QS 里没有 hispeed），所以这里是恒定值。
const APPROACH_MS = 2250 / (6 * (2 / 3) * 0.9);

let chartMeta = null;

const DIFF_NAME = { 2: 'BASIC', 3: 'ADVANCED', 4: 'EXPERT', 5: 'MASTER', 6: 'Re:MASTER', 7: '宴' };

function diffColor(slot) {
  switch (Number(slot)) {
    case 7: return '#ff7ad9';   // 宴
    case 6: return '#ffffff';   // 白
    case 5: return '#b678ff';   // 紫
    case 4: return '#ff5b5b';   // 红
    case 3: return '#ffcf3f';   // 黄
    case 2: return '#4be08a';   // 绿
    default: return '#9aa4b2';
  }
}

/** 只提取标题/艺术家/等级，用来做提示层。首音符时刻另由像素检测决定——
 *  simai 的 `{n}` 是「本小节分成 n 份」而不是「空过 n 拍」，照着解析会把
 *  出音符的时刻算晚（实测 110734 算成 12.75s，实际 6 秒就在打了）。 */
async function loadChartMeta() {
  if (!CHART_ID) return;
  try {
    const r = await fetch('/charts/' + encodeURIComponent(CHART_ID) + '.txt', { cache: 'no-store' });
    if (!r.ok) return;
    const txt = await r.text();
    const field = (k) => {
      const mm = new RegExp('^&' + k + '=([^\\r\\n]*)', 'm').exec(txt);
      return mm ? mm[1].trim() : '';
    };
    const slot = Number(CHART_DIFF) || 5;
    chartMeta = {
      title: field('title'),
      artist: field('artist'),
      level: field('lv_' + slot),
    };
    post({ note: `开场提示：${chartMeta.title || '(无标题)'} / ${chartMeta.artist || '?'} ` +
                 `${DIFF_NAME[slot] || ''}${chartMeta.level ? ' Lv.' + chartMeta.level : ''}` });
  } catch (e) {
    /* 提示层是锦上添花，拿不到谱面元信息就不画 */
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

let hudCtx;
function getHudCtx() {
  if (hudCtx === undefined) {
    try {
      // 和 bundle 拿的是同一个 2d context，可以直接在它画完的帧上继续叠
      hudCtx = mainCanvas.getContext('2d') || null;
    } catch (e) {
      hudCtx = null;
    }
  }
  return hudCtx;
}

/* 空场期到哪儿结束 —— 用像素检测决定，不靠解析谱面。
 *
 * 为什么不用谱面解析：simai 的 {n} 语义、宴谱的 x/E 记号、变速段都容易算错。
 * 实测 110734（宴）解析出「首音符 12.75s」，但画面 6 秒就已经在出音符了 ——
 * 用错的时间去叠提示层，就会把正在打的谱面盖住。
 *
 * 改成一个简单事实：空场期画面只有静止的判定圈与 HUD。拿 t=0 当基线，
 * 每隔半秒比一次，画面差异一超标就说明有音符进场了。 */
const DETECT_W = 90;
const DETECT_STEP_MS = 250;                             // 每 0.25 秒比一次
const DETECT_MAX_MS = 30000;                            // 超过 30 秒就不再找
const DETECT_RATIO = 0.012;                             // 差异像素占比阈值
// 90×90 下要跳过的 HUD 矩形（BPM、连击、左右 BREAK），它们自己会变
const DETECT_SKIP = [
  [0, 0, 24, 11], [58, 0, 90, 11],
  [0, 79, 32, 90], [56, 79, 90, 90],
];

let detCanvas = null, detCtx = null;

function grabSmall() {
  if (!detCanvas) {
    detCanvas = new OffscreenCanvas(DETECT_W, DETECT_W);
    detCtx = detCanvas.getContext('2d', { willReadFrequently: true });
  }
  detCtx.drawImage(mainCanvas, 0, 0, DETECT_W, DETECT_W);
  return detCtx.getImageData(0, 0, DETECT_W, DETECT_W).data;
}

function skipPixel(x, y) {
  for (let k = 0; k < DETECT_SKIP.length; k++) {
    const r = DETECT_SKIP[k];
    if (x >= r[0] && x < r[2] && y >= r[1] && y < r[3]) return true;
  }
  return false;
}

function diffRatio(a, b) {
  let diff = 0, total = 0;
  for (let y = 0; y < DETECT_W; y++) {
    for (let x = 0; x < DETECT_W; x++) {
      if (skipPixel(x, y)) continue;
      const i = (y * DETECT_W + x) * 4;
      total++;
      const d = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
      if (d > 60) diff++;
    }
  }
  return total ? diff / total : 0;
}

/* 预扫：在不编码的情况下把开头的画面快速渲染一遍，找出「谱面开始动」的时刻。
 * 必须先扫再编 —— 编码是不可回退的，一旦某一帧没叠提示层就补不回来了。 */
function detectIntroEnd(api, totalMs) {
  const limit = Math.min(totalMs, DETECT_MAX_MS);
  let baseline = null;
  for (let ms = 0; ms <= limit; ms += DETECT_STEP_MS) {
    api.renderMs(ms);
    const px = grabSmall();
    if (baseline === null) {
      baseline = px;
      continue;
    }
    const ratio = diffRatio(baseline, px);
    if (ratio >= DETECT_RATIO) {
      const end = Math.max(0, ms - APPROACH_MS);
      post({ note: `开场提示层：0 ~ ${(end / 1000).toFixed(2)}s（${(ms / 1000).toFixed(1)}s 检出音符，` +
                   `差异 ${(ratio * 100).toFixed(1)}%）` });
      return end;
    }
  }
  post({ note: '开场提示层：前 30 秒未见音符变化，不铺提示层' });
  return 0;
}

let introEndMs = 0;      // 0 = 不画提示层

function drawIntroOverlay(tMs, endMs) {
  const ctx = getHudCtx();
  if (!ctx) return;
  const S = PX;
  const FADE = 300;
  let alpha = 1;
  if (endMs - tMs < FADE) alpha = Math.max(0, (endMs - tMs) / FADE);
  // 开头 250ms 淡入，避免第一帧就是硬切
  if (tMs < 250) alpha *= tMs / 250;
  if (alpha <= 0.01) return;

  const meta = chartMeta || {};
  const color = diffColor(CHART_DIFF);
  const slotName = DIFF_NAME[Number(CHART_DIFF)] || '';
  const FONT = '"Noto Sans CJK SC", "Source Han Sans SC", "Droid Sans Fallback", system-ui, sans-serif';

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 顶部压暗，保证白字在亮背景上也读得清
  const g = ctx.createLinearGradient(0, 0, 0, S * 0.46);
  g.addColorStop(0, 'rgba(0,0,0,0.74)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S * 0.46);

  // 曲名（放在 BPM / 连击这两行 HUD 之下，避免压字）
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = S * 0.018;
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(S * 0.062)}px ${FONT}`;
  const title = meta.title || '';
  if (title) {
    let shown = title;
    while (shown.length > 1 && ctx.measureText(shown).width > S * 0.88) shown = shown.slice(0, -1);
    if (shown !== title) shown = shown.replace(/[\s.…]+$/, '') + '…';
    ctx.fillText(shown, S / 2, S * 0.180);
  }

  // 艺术家
  if (meta.artist) {
    ctx.font = `400 ${Math.round(S * 0.031)}px ${FONT}`;
    ctx.fillStyle = 'rgba(255,255,255,0.80)';
    let a = meta.artist;
    while (a.length > 1 && ctx.measureText(a).width > S * 0.82) a = a.slice(0, -1);
    if (a !== meta.artist) a = a.replace(/[\s.…]+$/, '') + '…';
    ctx.fillText(a, S / 2, S * 0.229);
  }

  // 难度胶囊
  const label = (slotName || 'DIFFICULTY') + (meta.level ? `  Lv.${meta.level}` : '');
  ctx.font = `700 ${Math.round(S * 0.034)}px ${FONT}`;
  const tw = ctx.measureText(label).width;
  const padX = S * 0.030;
  const bh = S * 0.064;
  const bw = tw + padX * 2;
  ctx.shadowBlur = 0;
  roundRect(ctx, (S - bw) / 2, S * 0.268, bw, bh, bh / 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = (Number(CHART_DIFF) === 6 || Number(CHART_DIFF) === 3) ? '#16181d' : '#ffffff';
  ctx.fillText(label, S / 2, S * 0.268 + bh / 2 + S * 0.002);

  // 底部：前奏进度条 + 文字
  const barW = S * 0.62;
  const barH = Math.max(3, Math.round(S * 0.008));
  const barX = (S - barW) / 2;
  const barY = S * 0.845;
  ctx.fillStyle = 'rgba(255,255,255,0.20)';
  roundRect(ctx, barX, barY, barW, barH, barH / 2);
  ctx.fill();
  const prog = Math.max(0, Math.min(1, endMs > 0 ? tMs / endMs : 0));
  if (prog > 0) {
    ctx.fillStyle = color;
    roundRect(ctx, barX, barY, Math.max(barH, barW * prog), barH, barH / 2);
    ctx.fill();
  }

  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = S * 0.012;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `500 ${Math.round(S * 0.029)}px ${FONT}`;
  ctx.fillText(`♪  谱面前奏  ${(tMs / 1000).toFixed(1)}s`, S / 2, barY - S * 0.030);

  ctx.restore();
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

  // 谱面元信息：只为开头空场期的提示层服务，拿不到也照常渲染
  await loadChartMeta();

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

  // 装载曲绘大圆盘背景（对标 lxns 视觉品质）
  try {
    const bgUrl = `/charts/${CHART_ID}/bg.png`;
    const bgResp = await fetch(bgUrl);
    if (bgResp.ok) {
      const blob = await bgResp.blob();
      const bitmap = await createImageBitmap(blob);
      if (typeof api.setBackgroundImage === 'function') {
        api.setBackgroundImage(bitmap);
        post({ note: '曲绘背景已装载' });
      }
    }
  } catch (e) {
    /* 允许背景加载失败回退 */
  }

  // 音画毫秒级对齐数学模型：
  // 1. render-bundle.js 在解析谱面时给全谱加入了 4 拍的前导时间：leadMs = (60000 * 4) / firstBpm。
  //    画面在 t = leadMs 时刻，第一个音符刚好砸中判定线。
  // 2. 谱面 maidata 中的 &first 决定了音频第 1 拍发生的时间：firstMs = firstSec * 1000。
  // 3. 画面必须从 t = 0 正常开始渲染，以完整保留 0~leadMs 开场倒数与音符飞入动画。
  // 4. 音频必须延后 delayMs = leadMs - firstMs 开始播放，使音乐的第一拍与画面的首个 Note 击打瞬间 0 误差重合。
  const leadMs = info.bpm > 0 ? (6e4 * 4) / info.bpm : 0;
  const firstMs = Number.isFinite(info.firstMs) ? info.firstMs : 0;
  const delayMs = Math.max(0, leadMs - firstMs);
  post({ note: `音画对齐计算：leadMs=${leadMs.toFixed(1)}ms, firstMs=${firstMs.toFixed(1)}ms -> 音频前置静音 delayMs=${delayMs.toFixed(1)}ms` });

  // 时长的取法（这一行决定了成片的音画是否对齐）：
  //
  //   谱面算出来的长度 info.totalMs 与官方音轨长度并不总是相等。
  //   实测 11303：谱面 135.0s，音轨只有 131.0s —— 按谱面铺画面，
  //   结尾就会多出 4 秒无声的空转画面，看的人会觉得"音画不同步"。
  //
  //   上游 maimai-chart-engine 的做法是以**音频为主时钟**：画面跟着音乐走。
  //   这里照做 —— 有音轨时，成片长度就取音轨长度，画面不再跑超。
  //   没有音轨（下载失败）时才退回谱面长度。
  //   显式传了 dur= 参数则以它为准（那是调用方明确要求的截断）。
  const chartMs = info.totalMs;
  const audioMs = audioPcm ? audioPcm.durationMs : 0;
  let totalMs = audioMs > 0 ? audioMs : chartMs;
  if (DUR_S > 0) totalMs = Math.min(DUR_S * 1000, audioMs > 0 ? audioMs : chartMs);
  if (audioMs > 0 && Math.abs(audioMs - chartMs) > 200) {
    post({ note: `时长对齐：谱面 ${(chartMs / 1000).toFixed(1)}s / 音轨 ${(audioMs / 1000).toFixed(1)}s ` +
                 `→ 成片按音轨 ${(totalMs / 1000).toFixed(1)}s` });
  }

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
      const delaySamples = Math.max(0, Math.round((delayMs / 1000) * sr));
      const totalAudioSamples = totalSamples + delaySamples;
      // 音轨只要覆到画面结束就够，多出来的截掉，免得容器被拉长
      const needSamples = Math.min(totalAudioSamples, Math.ceil(totalMs / 1000 * sr));
      const FRAME = 1024;                       // AAC 帧长固定 1024 采样
      for (let off = 0; off < needSamples; off += FRAME) {
        if (aerr) throw aerr;
        const n = Math.min(FRAME, needSamples - off);
        const buf = new Float32Array(n * nch);  // 交错布局
        for (let c = 0; c < nch; c++) {
          const src = audioPcm.channels[c];
          for (let i = 0; i < n; i++) {
            const audioIdx = (off + i) - delaySamples;
            buf[i * nch + c] = (audioIdx >= 0 && audioIdx < src.length) ? src[audioIdx] : 0;
          }
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

  // 空场期到哪儿结束：先在不编码的情况下快速预扫一遍，找出「谱面开始动」的时刻。
  // 检测不到（整支都没音符）就返回 0，行为与改动前完全一致。
  setPhase('scanning');
  const introEndMs = detectIntroEnd(api, totalMs);

  for (let i = 0; i < totalFrames; i++) {
    if (encErr) throw encErr;

    const tMs = i * 1000 / FPS;
    const tr = performance.now();
    // 画面从 tMs = 0 正常推进，开场 0~leadMs 留白与飞键动画完整呈现；
    // 音频在上面已经通过前置静音 delaySamples 实现了精确对齐。
    api.renderMs(tMs);
    // 提示层叠在同一个 canvas 上，必须在 renderMs 之后、new VideoFrame 之前
    if (introEndMs > 0 && tMs < introEndMs) drawIntroOverlay(tMs, introEndMs);
    renderAcc += performance.now() - tr;

    const te = performance.now();
    const frame = new VideoFrame(mainCanvas, {
      timestamp: Math.round(i * 1e6 / FPS),
      duration: Math.round(1e6 / FPS),
    });
    // 关键帧每 1 秒一个（原来 2 秒）。QQ 边下边播时，没下到的部分只能拿
    // 关键帧顶上，GOP 越密顶得越连续、越不像幻灯片；代价是多几帧 I 帧，
    // 谱面画面简单，实测体积只涨 3~5%。
    encoder.encode(frame, { keyFrame: i % FPS === 0 });
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
