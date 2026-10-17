// 模拟 OneBot v11 协议端（反向 WS）连接 HoshinoBot 的 8081/ws，
// 推一条群消息，把 bot 的 API 调用原样打印出来，用于验证命令端到端。
// 用法: node _mock_qq.mjs "<消息文本>" [等待秒数] [user_id]
const WS_URL = 'ws://127.0.0.1:8081/ws';
const TEXT = process.argv[2] || '帮助mai_preview';
const WAIT_S = Number(process.argv[3] || 25);
const USER_ID = Number(process.argv[4] || 22781078);
const SELF_ID = 3369764712;
const GROUP_ID = 986226358;

const ws = new WebSocket(WS_URL, {
  headers: {
    'X-Self-ID': String(SELF_ID),
    'X-Client-Role': 'Universal',
    'User-Agent': 'OneBot/11 (mock)',
  },
});

let n = 0;
const sent = [];

ws.addEventListener('open', async () => {
  console.log('[mock] WS 已连接', WS_URL);
  const meta = {
    post_type: 'meta_event', meta_event_type: 'lifecycle', sub_type: 'connect',
    self_id: SELF_ID, time: Math.floor(Date.now() / 1000),
  };
  ws.send(JSON.stringify(meta));
  console.log('[mock] -> lifecycle connect');

  await new Promise((r) => setTimeout(r, 1500));

  const ev = {
    post_type: 'message', message_type: 'group', sub_type: 'normal',
    message_id: 10001, group_id: GROUP_ID, user_id: USER_ID,
    raw_message: TEXT, font: 0, self_id: SELF_ID,
    time: Math.floor(Date.now() / 1000),
    message: [{ type: 'text', data: { text: TEXT } }],
    sender: { user_id: USER_ID, nickname: 'tester', card: '', role: 'owner' },
    anonymous: null,
  };
  ws.send(JSON.stringify(ev));
  console.log(`[mock] -> 群消息 "${TEXT}" (group=${GROUP_ID}, user=${USER_ID})`);
});

ws.addEventListener('message', (e) => {
  let m;
  try { m = JSON.parse(e.data); } catch { console.log('[mock] 非 JSON:', String(e.data).slice(0, 200)); return; }
  if (m.post_type) { console.log('[mock] <- 事件:', m.post_type, m.meta_event_type || m.notice_type || ''); return; }
  n += 1;
  const act = m.action;
  const p = m.params || {};
  if (act === 'send_msg' || act === 'send_group_msg') {
    const msg = p.message ?? p.messages;
    const flat = typeof msg === 'string' ? msg : JSON.stringify(msg);
    console.log(`[mock] <- ${act} #${n} len=${flat.length}`);
    console.log('        ' + flat.slice(0, 600));
    sent.push(flat);
  } else {
    console.log(`[mock] <- ${act} ${JSON.stringify(p).slice(0, 300)}`);
  }
  if (m.echo !== undefined) ws.send(JSON.stringify({ status: 'ok', retcode: 0, data: { message_id: n }, echo: m.echo }));
});

ws.addEventListener('error', (e) => console.log('[mock] WS 错误', e.message || ''));
ws.addEventListener('close', (e) => console.log('[mock] WS 关闭', e.code, e.reason));

setTimeout(() => {
  console.log(`\n[mock] 共收到 ${n} 次 API 调用，${sent.length} 条消息`);
  process.exit(0);
}, WAIT_S * 1000);
