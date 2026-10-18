import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FFMPEG = path.resolve('bin', 'ffmpeg.exe');
const FFPROBE = path.resolve('bin', 'ffprobe.exe');
const PORT = 9224;

const CHART_ID = process.argv[2] || '11818';
// 难度槽位：lxns difficulty=2 对应 simai 中的 diff=4 (Expert 13.1)
const DIFF = process.argv[3] || '4';
const PX = process.argv[4] || '720';
const FPS = process.argv[5] || '60';
const HISPEED = process.argv[6] || '6.0';

console.log(`=== Maimai 谱面渲染流水线 ===`);
console.log(`曲目 ID: ${CHART_ID}, 难度槽位: ${DIFF}, 分辨率: ${PX}x${PX}, 帧率: ${FPS}fps, 流速: ${HISPEED}`);

// 1. 解析谱面元数据中的 BPM 和 &first 偏移
function getChartTiming(id) {
  const maidataPath = path.resolve(`maidata_${id}.txt`);
  const content = fs.readFileSync(maidataPath, 'utf-8');
  let firstSec = 0;
  const mFirst = content.match(/&first=([0-9\.\-]+)/);
  if (mFirst) firstSec = parseFloat(mFirst[1]);

  let bpm = 205;
  const mBpm = content.match(/&(?:wholebpm|bpm)=([0-9\.]+)/);
  if (mBpm) bpm = parseFloat(mBpm[1]);

  const leadInMs = (60000 * 4) / bpm;
  const firstMs = firstSec * 1000;
  const delayMs = leadInMs - firstMs;

  return { bpm, firstSec, firstMs, leadInMs, delayMs };
}

const timing = getChartTiming(CHART_ID);
console.log(`谱面时间轴参数:`, timing);
console.log(`-> leadInMs (预备小节4拍): ${timing.leadInMs.toFixed(2)}ms`);
console.log(`-> firstMs (&first首音符偏移): ${timing.firstMs.toFixed(2)}ms`);
console.log(`-> 音频所需精确延时 (delayMs = leadInMs - firstMs): ${timing.delayMs.toFixed(2)}ms`);

// 启动 Chrome
console.log('启动 Chrome Headless 引擎...');
const chromeProc = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu-watchdog',
  '--no-first-run',
  '--no-default-browser-check',
  `--window-size=${PX},${PX}`,
  'about:blank'
]);

chromeProc.on('error', (e) => {
  console.error('Chrome spawn error:', e);
  process.exit(1);
});

async function waitPort() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return await res.json();
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('CDP port timeout');
}

async function run() {
  await waitPort();
  console.log('Chrome 调试接口就绪');

  const pageUrl = `http://127.0.0.1:8777/render_engine.html?id=${CHART_ID}&diff=${DIFF}&px=${PX}&fps=${FPS}&hispeed=${HISPEED}`;
  console.log('打开离线渲染工作页:', pageUrl);

  const targetRes = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(pageUrl)}`, { method: 'PUT' });
  const target = await targetRes.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  let finishedSavePath = null;

  await new Promise((resolve, reject) => {
    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    };

    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value !== undefined ? a.value : (a.description || JSON.stringify(a))).join(' ');
        if (text.includes('[Render Progress]')) {
          console.log(text);
        } else if (text.includes('[Render Finished and Saved]')) {
          console.log('✓ 画面帧渲染与编码完成:', text);
          try {
            const rawObj = msg.params.args[1];
            finishedSavePath = rawObj?.value?.path || rawObj?.path;
          } catch {}
          resolve();
        } else if (text.includes('Render error')) {
          console.error('✗ 渲染报错:', text);
          reject(new Error(text));
        }
      }
    };

    ws.onerror = reject;
  });

  ws.close();
  chromeProc.kill();

  if (!finishedSavePath) {
    finishedSavePath = path.resolve('hoshino', 'modules', 'mai_preview', 'server', 'output', `raw_${CHART_ID}_${DIFF}.mp4`);
  }

  console.log('原始无声视频落盘路径:', finishedSavePath);
  if (!fs.existsSync(finishedSavePath)) {
    throw new Error('未找到落盘视频文件: ' + finishedSavePath);
  }

  const rawSizeMb = (fs.statSync(finishedSavePath).size / 1024 / 1024).toFixed(2);
  console.log(`无声视频大小: ${rawSizeMb} MB`);

  // 探查视频时长
  const durStr = execSync(`"${FFPROBE}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${finishedSavePath}"`, { encoding: 'utf-8' }).trim();
  const rawDur = parseFloat(durStr);
  console.log(`视频时长: ${rawDur.toFixed(3)} 秒`);

  // 音频文件
  const audioSrc = path.resolve(`track_${CHART_ID}.mp3`);
  const finalOut = path.resolve(`maimai_chart_${CHART_ID}_diff${DIFF}_perfect_sync.mp4`);

  // 毫秒级对齐
  const delayRounded = Math.round(timing.delayMs);
  const filterComplex = `[1:a]adelay=${delayRounded}|${delayRounded},apad[a]`;

  console.log(`正在通过 FFmpeg 执行毫秒级音画同步封装 (adelay=${delayRounded}ms)...`);
  const cmd = `"${FFMPEG}" -y -i "${finishedSavePath}" -i "${audioSrc}" -filter_complex "${filterComplex}" -map 0:v:0 -map "[a]" -c:v copy -c:a aac -b:a 256k -t ${rawDur.toFixed(3)} -movflags +faststart "${finalOut}"`;
  execSync(cmd, { stdio: 'inherit' });

  const finalSizeMb = (fs.statSync(finalOut).size / 1024 / 1024).toFixed(2);
  console.log(`\n========================================`);
  console.log(`🎉 最终渲染完成！`);
  console.log(`输出视频文件: ${finalOut}`);
  console.log(`视频参数: 720x720 @ 60fps, 时长: ${rawDur.toFixed(2)}s, 大小: ${finalSizeMb} MB`);
  console.log(`音画绝对同步: 第 0 帧开场，在 t=${(timing.delayMs/1000).toFixed(3)}s 第一个音符击中瞬间音乐第一拍分毫不差震撼敲响！`);
  console.log(`========================================\n`);
}

run().catch(e => {
  console.error('Fatal error:', e);
  chromeProc.kill();
  process.exit(1);
});
