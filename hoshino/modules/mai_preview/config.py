# -*- coding: utf-8 -*-
"""mai_preview 模块配置（用户可直接修改本文件覆盖默认值）。

== 使用须知 ==
- 本文件会被 nonebot 作为插件自动 import，因此**只放常量定义，不要有任何
  副作用代码**（不许写文件、起服务、读环境变量之外的 I/O、改 sys.path）。
- 所有键都是模块级可变名，测试脚本（``_test_gate.py``）会直接重绑定其中的
  ``MP4_CACHE_DIR`` 来把副作用关进临时目录——重命名键会破坏这类调用方。
- 需要「动态读取」的场景请用 ``getattr(cfg, 'KEY', default)``，不要在本文件
  写计算逻辑。

== 键总览 ==
- 谱面与曲库数据：CHART_ROOT / CATALOG_JSON / ALIAS_JSON
- 时长校验工具：FFMPEG
- 手机桥接（Termux Agent 连网关）：PHONE_BRIDGE_* / PHONE_VIDEO_TIMEOUT_S / MP4_CACHE_DIR
- 手机「按需渲染」链路：PHONE_RENDER_* / PHONE_SAVE_URL
- 成品记账：PHONE_STORE_*

== 难度槽位契约（改代码前务必先读）==
上传入库与缓存查询都只认 simai 的 2-7 槽位：
    2=Basic(绿) 3=Advanced(黄) 4=Expert(红) 5=Master(紫) 6=Re:Master(白) 7=Utage(宴)
这份白名单写死在 ``phone_bridge.py`` 的 ``_VALID_DIFF_SLOTS``。0/1/8/9/99 之类
一律按「非法难度」拒收（HTTP 422 ``missing_ids``，日志里看不出是难度而非 ID 的
问题）。若将来 simai 真的新增 8+ 槽位，必须同时改 ``_VALID_DIFF_SLOTS``、
``render_core.DIFF_ALIASES``、``alias_resolve.SLOT_COLOR`` 与
``phone_client/render_server.py`` 的 ``SLOT_NAME`` 四处，少改一处就会静默拒收。
"""

import os

# 本插件目录（自包含，部署只拷 modules 即可跑）
HERE = os.path.dirname(os.path.abspath(__file__))

# ---------- 谱面数据（插件自带 data/<曲名>/maidata.txt） ----------
CHART_ROOT = os.path.join(HERE, 'data')

# ---------- 曲库与别名（ID/别名解析用） ----------
# ADX 谱面目录（short_id / title / difficulties 槽位），随插件打包
CATALOG_JSON = os.path.join(HERE, 'data', 'catalog.json')
# maimaiDX 别名库 list[{song_id, name, alias:[...]}]（用户指定数据源，
# 位于兄弟模块 maimaiDX，随 modules 一起部署）
ALIAS_JSON = os.path.normpath(os.path.join(
    HERE, '..', 'maimaiDX', 'static', 'data', 'music_alias.json'))

# ---------- ffprobe（仅用于校验手机回传视频的时长） ----------
# 留空/删除则依次探测 PATH > winget 安装目录。
# 服务器（如 Windows Server 2012 R2 无 winget）推荐：下载 gyan.dev 的
# ffmpeg-release-essentials.zip 解压后在这里写死绝对路径：
# ↓ 留空 = 自动探测。当你要在服务器上写死路径时，取消下面这行的注释并改成实际路径
#   （注意 r 必须在引号外）：
# FFMPEG = r'C:\Tools\ffmpeg\bin\ffmpeg.exe'
FFMPEG = ''

# ---------- 手机渲染节点通信桥（Termux Agent 连接网关） ----------
PHONE_BRIDGE_HOST = '0.0.0.0'
PHONE_BRIDGE_PORT = 8778                           # 手机 WebSocket 反向连接与上传端口
PHONE_BRIDGE_TOKEN = "YOUR_SECRET_TOKEN"    # 手机端连接与鉴权密钥（与 phone_client/config.json 一致）
# 手机访问本桥时应该用的地址。服务器在云上、手机在别处，服务器自己猜不出
# 该用哪个地址（猜出来的是内网 10.0.0.x，手机连不上），必须在这里写死。
# 填公网 IP 或域名，不带 http:// 和端口，例如：'YOUR_SERVER_HOST'
# 留空则退回「探测本机出口 IP」，只适用于服务器与手机同局域网的场景。
PHONE_BRIDGE_PUBLIC_HOST = 'YOUR_SERVER_HOST'        # 阿里云 TS 服务器公网地址
PHONE_VIDEO_TIMEOUT_S = 180                        # 等待手机回传视频的超时时间（秒）
                                                   # 全曲 60fps MP4 约 30-70 MB，网络回传
                                                   # 实测约 1.2 MB/s（52 MB ≈ 42 秒），故给足余量。
                                                   # 设小了会出现「手机传完了、服务器早就放弃」的错判。
MP4_CACHE_DIR = os.path.join(HERE, 'cache', 'mp4') # 手机录制 60fps MP4 本地持久化缓存目录

# ---------- 手机「按需渲染」：手机没有预录视频时，让手机自己现渲染 ----------
# 链路：服务器把渲染 URL 排进渲染队列 → 手机 Chrome 常驻的 worker.html 轮询领任务 →
#       Worker 内 GPU 逐帧编码 60fps MP4 → POST 手机本地落盘服务 → /sdcard/Download/maimai/
# 渲染器文件与谱面数据也都在手机上（phone_client/render_server.py 从 127.0.0.1:8777 提供），
# 服务器不托管任何静态文件。
PHONE_RENDER_ENABLED = True                        # 关掉则「谱面确认」只认手机预录好的视频
# 手机访问渲染页的地址。必须是手机自己的 127.0.0.1（安全上下文才有 WebCodecs
# 硬件编码；任何非 localhost 地址下浏览器都隐藏 VideoEncoder，编码页必然失败）。
# 这个服务由手机上的 render_server.py 提供，不需要 adb reverse。
PHONE_RENDER_BASE = 'http://127.0.0.1:8777'
PHONE_RENDER_UPLOAD = ''                           # 旧字段，保留兼容，已不使用
PHONE_RENDER_PX = 720                              # 渲染分辨率（正方形边长，像素）
PHONE_RENDER_FPS = 60                              # 帧率
PHONE_RENDER_BITRATE = 4_000_000                   # 码率（bps）
PHONE_RENDER_TIMEOUT_S = 900                       # 现渲染允许的最长耗时（全曲约 90 秒，留足余量）
# ---------- 成品存哪：手机自己写盘，服务器不参与搬运 ----------
# 渲染产物由同一个 render_server.py 的落盘端点接住，走 127.0.0.1 的 loopback ——
# 一个字节都不出手机，也不经过服务器。
# 为什么必须有这个本地端点：Android Chrome 的 a[download] 没有用户手势不生效
# （无人值守的批量场景根本点不了），OPFS 又躺在 Chrome 私有沙箱里，
# Termux 和文件管理器都看不见。起个本地 HTTP 端点写盘是唯一干净的办法。
PHONE_SAVE_URL = 'http://127.0.0.1:8780/save'

# ---------- 服务器缓存：只留最近要过的那一小撮 ----------
# 设计取向：视频的权威副本在手机，服务器只是「发群时的中转站」。
# 所以服务器缓存不再永久保留，超过上限就按最久没被用过的顺序淘汰。
# 1 GB ≈ 20~30 支全曲 60fps 成片，够覆盖「群里反复点的那几十首」。
MP4_CACHE_MAX_MB = 1024                            # 服务器 MP4 缓存上限（MB），0 表示不限制

# ---------- 手机成品目录（只读视角） ----------
# 手机上的 MP4 由 Worker 渲染后直接写进这个目录，不经过服务器。
# 服务器这边只剩两个用途：① 从文件名解析出「这支是曲id+难度」来核账；
# ② 手机上翻目录时给用户看清单。真正的写盘由手机自己完成。
PHONE_STORE_ENABLED = True                         # 关掉则不做手机侧的成品记账
PHONE_STORE_DIR = '/sdcard/Download/maimai'        # 手机上成品存放目录
PHONE_STORE_TIMEOUT_S = 300                        # 单次查询手机目录的超时（秒）
# 注意：这里**没有**手机落盘服务的端口。save_server.py 只在手机自己的
# 127.0.0.1 上监听，服务器（云上）无论如何都连不进去，配个端口号只会误导人。
# 手机上有哪些文件，只信手机自己上报（POST /api/stored / video_stored）。

# ---------- 手机渲染的总闸门 ----------
# Worker 渲染 → 直接 POST 到手机本地 save_server → 落盘。全程不经过服务器，
# 所以服务器既不需要等 ack，也不需要保留副本再删一遍。
# 手机离线/工作页没开时，命令会直接告诉用户去开，而不是排个永远不动的队。
PHONE_RENDER_ENABLED = True
