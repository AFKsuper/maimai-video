# maimai-video

基于 deepseek & HoshinoBot V2 的舞萌DX（maimai DX）谱面生成视频插件。

在 QQ 群里发一句 `谱面确认 834 紫`，机器人就把这首歌对应难度的谱面渲染成
**720p / 60fps / H.264 的 MP4** 发进群。

渲染不是跑在服务器上，而是**跑在你自己的安卓手机上**：
云服务器只负责接指令、管队列、发视频，真正的逐帧编码交给手机 Chrome 的
`WebCodecs`（硬编码），成片直接写进手机存储。服务器因此不需要 GPU、不需要
折腾 ffmpeg 长任务，一首 3 分钟的全曲谱面大约 90 秒出片。

---

## 它是怎么工作的

```
QQ 群消息「谱面确认 834 紫」
        │
        ▼
┌───────────────────────────────────────────────┐
│ 云服务器（Windows + HoshinoBot）               │
│  · 解析曲目 ID / 别名 / 难度                   │
│  · 查本地 MP4 缓存（LRU，默认 1 GB）           │
│  · 缓存没有 → 让手机出片，或让手机回传已存的片 │
│  · 拿到文件后发群                             │
│  · 手机桥 8778（aiohttp，需安全组放行）        │
└───────────────────────────────────────────────┘
        ▲ 手机主动出站连接（服务器从不主动连手机）
        │
┌───────────────────────────────────────────────┐
│ 安卓手机（Termux + Chrome）                    │
│  · render_server.py：8777 渲染页 + 8780 落盘   │
│  · Chrome 打开 worker.html，WebCodecs 逐帧编码 │
│  · 成片写进 /sdcard/Download/maimai/           │
│  · POST /api/stored 告诉服务器「这支在我这儿」 │
└───────────────────────────────────────────────┘
```

关键点：**所有跨网通信都是手机发起的出站连接**。服务器在公网、手机在 4G、
在 NAT 后面、IP 会变，全都不影响。

---

## 目录结构

```
hoshino/modules/mai_preview/
├─ mai_preview.py           Hoshino 模块入口（命令注册）
├─ phone_bridge.py          手机通信桥（aiohttp，8778）：任务下发/回传/记账/缓存
├─ render_core.py           渲染参数与难度别名
├─ alias_resolve.py         曲目 ID / 别名解析
├─ video_verify.py          回传视频的 ffprobe 时长校验
├─ config.py                全部可调参数
├─ data/
│  ├─ catalog.json          曲库元数据
│  ├─ id2dir.json           ID → 谱面目录
│  └─ <曲名>__<id>/maidata.txt   谱面本体（需自行导入，见下）
├─ phone_client/            手机端
│  ├─ render_server.py      8777 渲染页 + 8780 落盘（纯 stdlib）
│  ├─ phone_agent.py.b64    Agent 源码（base64，避免传输损坏）
│  ├─ web/                  worker.html + 编码 worker + 渲染 bundle
│  ├─ start_render.sh       手机端一键启动
│  └─ start_agent.sh        Agent 启动
├─ server/                  渲染前端源文件（构建前的副本）
└─ tools/
   ├─ import_data.py        从 ADX 数据源导入谱面
   └─ patch_agent_b64.py    维护 phone_agent.py.b64
```

---

## 安装

### 1. 服务器侧

把整个 `mai_preview` 目录放进 `hoshino/modules/`，然后在
`hoshino/config/__bot__.py` 的 `MODULES_ON` 里加上 `'mai_preview'`。

依赖：`aiohttp`（HoshinoBot 自带）、`ffmpeg`/`ffprobe`（只用于校验时长）。
ffmpeg 不在 PATH 时，在 `config.py` 里写死 `FFMPEG = r'C:\...\ffmpeg.exe'`。

`alias_resolve.py` 需要兄弟模块 `maimaiDX` 的别名库
（`modules/maimaiDX/static/data/music_alias.json`）；不装也能用纯数字曲目 ID。

### 2. 谱面数据

`data/` 里只带了 `catalog.json` 与 `id2dir.json`。谱面本体（每首歌的 `maidata.txt`）
请用 `tools/import_data.py` 从你自己的数据源导入，仓库里不附带。

### 3. 手机侧

见 [`docs/手机渲染部署指南.md`](docs/手机渲染部署指南.md)，里面有从零开始的
完整步骤、故障排查和性能实测数据。

---

## 配置

改 `config.py`，**下面这些必须改**：

| 参数 | 说明 |
|---|---|
| `PHONE_BRIDGE_TOKEN` | 鉴权密钥，默认值不要用 |
| `PHONE_BRIDGE_PUBLIC_HOST` | 服务器公网 IP 或域名。云上必须写死，否则会猜成内网 IP 导致手机连不上 |

`PHONE_BRIDGE_PORT` 默认 `8778`，需要在云厂商安全组放行入方向 `TCP:8778`。

其它常用项：`MP4_CACHE_MAX_MB`（缓存上限，默认 1024）、
`PHONE_RENDER_PX/FPS/BITRATE`（输出规格，默认 720/60/4Mbps）。

---

## 用法

群里发送：

```
谱面确认 <曲目ID或别名> [难度]
```

难度可写：`绿`/`Basic`、`黄`/`Advanced`、`红`/`Expert`、`紫`/`Master`、
`白`/`Re:Master`、`宴`/`Utage`，也可以直接写槽位 `2`~`7`。不写默认紫谱。

响应速度取决于视频在不在：

| 情况 | 耗时 |
|---|---|
| 服务器缓存命中 | 1 秒内 |
| 手机已预录，等它传上来 | 数秒 |
| 手机需要现场编码 | 1–2 分钟 |

`帮助mai_preview` 可以看内置说明。

---

## 注意事项

- **难度校验只有一道，而且它拦不住「难度发错」**。服务器用 catalog 的
  `duration_ms` 校验回传视频，阈值是比值落在 0.75–1.35 之外才拒收；但同一首歌
  各难度的时长几乎一样（全库 296 首各难度时长完全相同，11879 的四个难度
  全是 162499ms），实测 22710 组错难度组合里 0 组能被这条闸门拦下。
  难度正确性最终靠手机 Agent 的**严格文件名匹配**保证。
- 手机上的 `render_server.py` 与 Chrome 里的 `worker.html` 标签页都要活着，
  否则成品存不下来、或者接不到任务。
- 服务器缓存可以随时清空，权威副本在手机上，下次请求会重新传一趟。
- 谱面数据来自第三方，请自行确认授权与使用范围；本仓库不附带谱面本体。

---

## 文档

- [`docs/手机渲染部署指南.md`](docs/手机渲染部署指南.md) —— 从零部署、日常维护、
  故障排查、性能参考，以及反方向通道（gost 中继）说明。

## License

代码以 MIT 协议发布。谱面、曲绘、音频等数据的版权归各自权利人所有，
本仓库不包含这些数据。
