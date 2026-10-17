#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
save_server.py —— 手机本地「落盘服务」，跑在 Termux 里。

## 它解决什么问题

原来的流程是：

    手机 Chrome 渲染 ──上传 40MB──▶ 服务器 ──存缓存──▶ 需要时再让手机下载回来

同一份字节要在 WiFi 上走两遍，而且手机自己渲染出来的东西，手机上反而没有。

现在改成：

    手机 Chrome 渲染 ──POST 到 127.0.0.1:8780──▶ 本脚本直接写进手机存储
                                                  （**一个字节都不出手机**）
                                                 ↓
                                       只把「我存好了」这个事实告诉服务器

服务器只保留最近常用的少量成品（默认 1GB，LRU 淘汰），需要发群时再让 Agent 回传。

## 为什么不让浏览器自己存

Android Chrome 上 `a[download]` **必须要用户手势**才生效（实测：同一段代码，
带手势触发就落盘，不带手势点下去毫无反应）。批量预渲染是后台自动跑的，
不可能每支都等人点一下。

File System Access API（`showDirectoryPicker`）虽然能拿到目录句柄，但每次
页面重载后都要重新授权，同样躲不开手势。

所以改成「浏览器把成品 POST 给本机的一个小服务，由它落盘」——
走的是 loopback，不占 WiFi，也不需要任何点击。

## 用法

    python3 save_server.py            # 监听 127.0.0.1:8780
    python3 save_server.py 8781       # 换端口

## 接口

    GET  /health
         → {"ok": true, "dir": "/sdcard/Download/maimai", "count": 12}

    POST /save?name=11879_5_Xaleid.mp4&chart_id=11879&diff=5
         body = 原始 MP4 字节
         → {"ok": true, "path": "...", "size": 54755134, "ms": 1840}

    OPTIONS /save    （CORS 预检）
"""

import json
import os
import re
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, unquote, urlencode
import urllib.request

# 成品落盘目录。用 /sdcard/Download/maimai 而不是 /sdcard/maimai_videos：
# 前者在手机「文件管理 / 下载」里能直接看到，方便人工翻检。
SAVE_DIR = os.environ.get("MAIMAI_SAVE_DIR", "/sdcard/Download/maimai")

# 端口默认 8780。选它是因为 8777（静态页）和 8778（服务器桥）都被占了，
# 而且 adb reverse 只映射了那两个，8780 留在手机本地、天然不会被转发出去。
DEFAULT_PORT = 8780

# 文件名白名单：只允许「数字_数字[_任意中英文]」且必须以 .mp4 结尾。
# 不允许任何路径分隔符 —— 这是唯一一道防目录穿越的闸门。
NAME_RE = re.compile(r"^[0-9]{1,12}_[0-9]{1,2}(_[^/\\:*?\"<>|]{0,80})?\.mp4$")

MAX_BYTES = 512 * 1024 * 1024  # 单支上限 512MB，防止误传把盘写满

# ---------------------------------------------------------------------------
# 存好之后要告诉服务器一声，否则服务器的归档索引永远停在旧数字上：
# 批量预渲染会重复渲染手机上已有的曲子，用户点谱面确认也会被当成「手机没有」。
#
# 地址从环境变量取，由启动脚本传进来；不写死 IP 是因为家里和外面网段不同。
# 取不到就跳过通知 —— 落盘本身才是主要职责，通知失败不该让一次成功的落盘
# 变成失败（那样 Worker 会以为没存上，重试或报错）。
# ---------------------------------------------------------------------------
BRIDGE_URL = os.environ.get("MAIMAI_BRIDGE_URL", "").strip()
BRIDGE_TOKEN = os.environ.get("MAIMAI_BRIDGE_TOKEN", "").strip()
NOTIFY_TIMEOUT = 8


def notify_server(chart_id: str, diff: str, name: str, path: str, size: int) -> bool:
    """把「这支已经存在手机上了」告诉服务器。失败只记一行日志，不抛异常。"""
    if not BRIDGE_URL:
        return False
    q = urlencode({
        "token": BRIDGE_TOKEN,
        "chart_id": chart_id,
        "diff": diff,
        "name": name,
        "path": path,
        "size": size,
    })
    url = "%s/api/stored?%s" % (BRIDGE_URL.rstrip("/"), q)
    try:
        req = urllib.request.Request(url, data=b"{}", method="POST",
                                     headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=NOTIFY_TIMEOUT) as r:
            body = r.read(400).decode("utf-8", "replace")
        sys.stderr.write("[notify] %s -> %s\n" % (name, body))
        sys.stderr.flush()
        return True
    except Exception as e:
        sys.stderr.write("[notify] 通知服务器失败（%s）: %s\n" % (name, e))
        sys.stderr.flush()
        return False


def human_dir_check() -> str:
    os.makedirs(SAVE_DIR, exist_ok=True)
    return SAVE_DIR


def list_count() -> int:
    try:
        return sum(1 for n in os.listdir(SAVE_DIR) if n.endswith(".mp4"))
    except OSError:
        return 0


def list_files() -> list:
    """只列 .mp4 的文件名，不带路径 —— 服务器只关心名字。"""
    try:
        return sorted(n for n in os.listdir(SAVE_DIR) if n.endswith(".mp4"))
    except OSError:
        return []


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "MaimaiSave/1.0"

    # ---------- 基础设施 ----------

    def log_message(self, fmt, *args):
        # 默认实现会往 stderr 打一行，Termux 里看着吵；改成带时间戳的单行
        sys.stderr.write("[%s] %s\n" % (time.strftime("%H:%M:%S"), fmt % args))
        sys.stderr.flush()

    def _cors(self):
        # 页面是从 http://127.0.0.1:8777 加载的，POST 到 127.0.0.1:8780 属于跨源，
        # 且 Content-Type 不是简单类型，会先发 OPTIONS 预检 —— 两处都得放行。
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Name, X-Chart-Id, X-Diff")
        self.send_header("Access-Control-Max-Age", "86400")

    def _json(self, code: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # ---------- 路由 ----------

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path in ("/health", "/healthz", "/"):
            self._json(200, {
                "ok": True,
                "service": "maimai_save_server",
                "dir": SAVE_DIR,
                "count": list_count(),
                "time": time.time(),
            })
            return
        if path == "/list":
            # 服务器要能直接问「这支在不在手机上」，否则一旦通知丢了，
            # 服务器会以为没存，批量重复渲染同一首。文件名单是最硬的证据。
            self._json(200, {
                "ok": True,
                "dir": SAVE_DIR,
                "files": list_files(),
            })
            return
        self._json(404, {"ok": False, "error": "not found"})

    def do_POST(self):
        u = urlparse(self.path)
        if u.path != "/save":
            self._json(404, {"ok": False, "error": "not found"})
            return

        q = parse_qs(u.query)
        name = (q.get("name") or [""])[0]
        # 也允许放在请求头里（Worker 里拼 query 不方便时用）
        if not name:
            name = self.headers.get("X-Name", "")
        name = unquote(name).strip()

        if not name or not NAME_RE.match(name):
            self._json(422, {
                "ok": False,
                "error": "文件名不合法",
                "name": name,
                "hint": "要形如 <曲id>_<难度>.mp4 或 <曲id>_<难度>_<曲名>.mp4",
            })
            return

        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = 0
        if length <= 0:
            self._json(422, {"ok": False, "error": "没有收到内容（Content-Length=0）"})
            return
        if length > MAX_BYTES:
            self._json(413, {"ok": False, "error": "文件太大", "size": length, "max": MAX_BYTES})
            return

        try:
            human_dir_check()
        except OSError as e:
            self._json(500, {"ok": False, "error": "存储目录不可写: %s" % e})
            return

        final_path = os.path.join(SAVE_DIR, name)
        part_path = final_path + ".part"
        t0 = time.time()
        written = 0

        # 先写 .part 再原子改名：中途断网/被杀进程时不会留下
        # 一个「看着完整、其实截断」的 mp4 被后续检索当成成品发出去。
        try:
            with open(part_path, "wb") as f:
                remaining = length
                while remaining > 0:
                    chunk = self.rfile.read(min(256 * 1024, remaining))
                    if not chunk:
                        break
                    f.write(chunk)
                    written += len(chunk)
                    remaining -= len(chunk)
                f.flush()
                os.fsync(f.fileno())
        except Exception as e:
            try:
                os.remove(part_path)
            except OSError:
                pass
            self._json(500, {"ok": False, "error": "写盘失败: %s" % e})
            return

        if written != length:
            try:
                os.remove(part_path)
            except OSError:
                pass
            self._json(500, {"ok": False, "error": "只写到 %d / %d 字节" % (written, length)})
            return

        os.replace(part_path, final_path)

        chart_id = (q.get("chart_id") or [""])[0]
        diff = (q.get("diff") or [""])[0]
        if not chart_id or not diff:
            # 没带难度信息时，从文件名里自己拆 —— 文件名规范就是 <id>_<diff>[_名字].mp4
            stem = name[:-4]
            parts = stem.split("_", 2)
            if len(parts) >= 2:
                chart_id = chart_id or parts[0]
                diff = diff or parts[1]

        # 落盘成功了才通知。放在响应之前、同步执行：Worker 收到 200 就认为这条
        # 彻底完事，如果通知还在路上就切下一条，服务器的归档索引会落后一拍。
        notified = notify_server(chart_id, diff, name, final_path, written)

        self._json(200, {
            "ok": True,
            "path": final_path,
            "name": name,
            "size": written,
            "ms": int((time.time() - t0) * 1000),
            "chart_id": chart_id,
            "diff": diff,
            "notified": notified,
        })


def main():
    port = DEFAULT_PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    try:
        human_dir_check()
    except OSError as e:
        sys.stderr.write("当前没有可用的视频存储目录！请检查目录权限或配置：%s\n" % e)
        return 1

    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    sys.stderr.write("手机本地落盘服务已启动: http://127.0.0.1:%d  ->  %s\n" % (port, SAVE_DIR))
    sys.stderr.write("已有成品 %d 支\n" % list_count())
    sys.stderr.flush()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        sys.stderr.write("收到中断，退出\n")
    finally:
        srv.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
