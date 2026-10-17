#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""render_server.py —— 手机本地「渲染页 + 落盘」服务，跑在 Termux 里。

## 它解决什么问题

渲染页必须从**安全上下文**加载，否则浏览器不暴露 WebCodecs 的 `VideoEncoder`，
编码直接失败。`http://localhost`（也就是 `127.0.0.1`）算安全上下文，`http://1.2.3.4`
不算。

原先是靠 `adb reverse tcp:8777` 把服务器的 8777 映射到手机回环，才凑出这个
localhost。这要求有一台电脑连着手机做中转 —— 服务器一旦搬到云上，这条路就断了。

现在把渲染页整个搬到手机上，手机访问自己的 `127.0.0.1:8777`，安全上下文天然成立：
不需要 adb、不需要电脑、不需要服务器的 8777 端口。

## 它同时干什么

还是个落盘端点：Chrome 里渲染出来的 MP4 直接 POST 到 `/save`，由本脚本写进
`/sdcard/Download/maimai/`。**一个字节都不出手机。**

之所以必须有这个端点：Android Chrome 的 `a[download]` 无人值守点不动，
OPFS 又躺在 Chrome 私有沙箱里、Termux 和文件管理器都看不见。

## 谱面数据从哪来

铺面是 simai 文本。优先读手机本地的 `charts/<id>.txt`；没有就去
`https://adxdls.saop.cc/adxcs/<id>/maidata.txt` 拉一次，落到本地目录下次复用。
这条路是手机直连公网，不经过服务器。

## 用法

    python3 render_server.py                 # 渲染页 8777 + 落盘 8780，一起起
    python3 render_server.py --dir /sdcard/Download/maimai
    python3 render_server.py --html-only     # 只起渲染页（8777）

## 接口

    8777 端口（渲染器静态文件，给手机浏览器用）
        GET  /                      -> worker.html
        GET  /worker.html           -> 常驻工作页（轮询服务器领任务）
        GET  /encoder-worker.js     -> Web Worker 编码器
        GET  /render-bundle.js      -> 渲染引擎打包
        GET  /vendor_mp4_muxer.mjs  -> MP4 封装
        GET  /charts/<id>.txt       -> 谱面文本（本地有就读本地，没有就去远端拉）
        GET  /healthz               -> ok

    8780 端口（落盘，只给同机的 Chrome 用）
        GET  /health                -> {"ok":true,"dir":...,"count":N}
        GET  /list                  -> {"ok":true,"files":[...],"count":N}
        POST /save?chart_id=..&diff=..&name=..   body=MP4 字节
        OPTIONS /save               （CORS 预检）
"""

from __future__ import annotations

import argparse
import json
import os
import re
import socket
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlparse, parse_qs, urlencode, urlsplit
from urllib.request import Request, urlopen

# ---------------------------------------------------------------------------
# 目录与常量
# ---------------------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))            # 脚本所在目录

# 渲染器静态文件在哪。优先找脚本旁边的 web/，没有就退回 /sdcard/Download/maimai_web
# （部署时直接把文件推在 sdcard 上、不往 Termux 家目录复制，省一步也能跑）。
_CANDIDATES = [
    os.path.join(HERE, "web"),
    "/sdcard/Download/maimai_web",
]
ASSETS_DIR = next((d for d in _CANDIDATES if os.path.isdir(d)), _CANDIDATES[0])

# 谱面本地缓存：放 sdcard 上，Termux 重装/清数据也不会丢
CHARTS_DIR = os.environ.get("MAIMAI_CHARTS_DIR", "/sdcard/Download/maimai_charts")
SAVE_DIR = os.environ.get("MAIMAI_SAVE_DIR", "/sdcard/Download/maimai")

HTML_PORT = int(os.environ.get("MAIMAI_HTML_PORT", "8777") or "8777")
SAVE_PORT = int(os.environ.get("MAIMAI_SAVE_PORT", "8780") or "8780")

# 谱面远端来源（与服务器版 serve.py 用的是同一个地址）
REMOTE_CHART_URL = os.environ.get(
    "MAI_PREVIEW_REMOTE", "https://adxdls.saop.cc/adxcs/{id}/maidata.txt"
)
REMOTE_TIMEOUT_S = 10
REMOTE_UA = ("Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 "
             "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

# 存好之后通知服务器（服务器据此记账，下次点这首就知道手机里有了）
BRIDGE_URL = os.environ.get("MAIMAI_BRIDGE_URL", "").strip()
BRIDGE_TOKEN = os.environ.get("MAIMAI_BRIDGE_TOKEN", "").strip()
NOTIFY_TIMEOUT = 8


def _load_bridge_from_config() -> None:
    """环境变量没给桥接地址时，退回去读 phone_client/config.json。

    为什么需要这条兜底：环境变量只能由启动脚本 export，而手机上这个进程是
    `nohup python3 render_server.py` 起的，谁忘了在启动脚本里写 export，
    落盘后就会**静默不通知**（notify_server 第一句 `if not BRIDGE_URL` 直接
    返回 False，日志里连一行失败都没有，只有「[save]」没有「[notify]」），
    服务器上 stored_count 永远 0、批量预渲染永远重复做同一批曲目。

    部署时 config.json 本来就是手机侧的既有配置（server_host/port/token），
    直接复用，比让每个启动脚本各自记得 export 两个变量可靠得多。
    """
    global BRIDGE_URL, BRIDGE_TOKEN
    if BRIDGE_URL:
        return
    for p in (
        os.path.join(HERE, "config.json"),
        os.path.join(HERE, "phone_client", "config.json"),
        "/sdcard/Download/phone_client/config.json",
        "/sdcard/Download/config.json",
    ):
        if not os.path.isfile(p):
            continue
        try:
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            continue
        host = str(data.get("server_host") or "").strip()
        if not host:
            continue
        port = data.get("server_port") or 8778
        BRIDGE_URL = "http://%s:%s" % (host, port)
        if not BRIDGE_TOKEN:
            BRIDGE_TOKEN = str(data.get("token") or "").strip()
        log("[notify] 桥接地址取自 %s: %s" % (p, BRIDGE_URL))
        return




# 文件名白名单：只允许「数字_数字[_任意中英文]」且必须以 .mp4 结尾。
# 不允许任何路径分隔符 —— 这是唯一一道防目录穿越的闸门。
NAME_RE = re.compile(r"^[0-9]{1,12}_[0-9]{1,2}(_[^/\\:*?\"<>|]{0,80})?\.mp4$")
CHART_RE = re.compile(r"^/charts/([0-9]{1,12})(?:\.txt|/maidata\.txt)$")
MAX_BYTES = 512 * 1024 * 1024   # 单支上限 512MB，防止误传把盘写满

MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".mp4": "video/mp4",
    ".png": "image/png",
    ".svg": "image/svg+xml",
}

_log_lock = threading.Lock()


def log(msg: str) -> None:
    with _log_lock:
        sys.stderr.write("%s %s\n" % (time.strftime("%H:%M:%S"), msg))
        sys.stderr.flush()


def ext_of(path: str) -> str:
    base = os.path.basename(path)
    dot = base.rfind(".")
    return base[dot:].lower() if dot >= 0 else ""


# 桥接地址兜底：必须在 log() 定义之后调用，否则它自己那行日志会 NameError
_load_bridge_from_config()


# ---------------------------------------------------------------------------
# 落盘目录
# ---------------------------------------------------------------------------
def ensure_save_dir() -> str:
    os.makedirs(SAVE_DIR, exist_ok=True)
    return SAVE_DIR


def list_videos() -> list:
    try:
        names = os.listdir(SAVE_DIR)
    except OSError:
        return []
    return sorted(n for n in names if n.lower().endswith(".mp4"))


def notify_server(chart_id: str, diff: str, name: str, path: str, size: int) -> bool:
    """把「这支已经存在手机上了」告诉服务器。失败只记一行日志，不影响落盘。"""
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
        req = Request(url, data=b"{}", method="POST",
                      headers={"Content-Type": "application/json"})
        with urlopen(req, timeout=NOTIFY_TIMEOUT) as r:
            body = r.read(400).decode("utf-8", "replace")
        log("[notify] %s -> %s" % (name, body))
        return True
    except Exception as e:
        log("[notify] 通知服务器失败（%s）: %s" % (name, e))
        return False


# ---------------------------------------------------------------------------
# 谱面：本地缓存 + 远端懒加载
# ---------------------------------------------------------------------------
def chart_cache_path(chart_id: str) -> str:
    return os.path.join(CHARTS_DIR, "%s.txt" % chart_id)


def read_local_chart(chart_id: str) -> bytes | None:
    p = chart_cache_path(chart_id)
    if os.path.isfile(p):
        try:
            with open(p, "rb") as f:
                data = f.read()
            if data:
                return data
        except OSError:
            pass
    return None


def fetch_remote_chart(chart_id: str) -> bytes | None:
    """去远端拉一次谱面并落盘。手机直连公网，不经过服务器。"""
    url = REMOTE_CHART_URL.format(id=chart_id)
    try:
        req = Request(url, headers={"User-Agent": REMOTE_UA})
        with urlopen(req, timeout=REMOTE_TIMEOUT_S) as r:
            if r.status != 200:
                log("[chart] %s 远端返回 %s" % (chart_id, r.status))
                return None
            data = r.read()
        if not data:
            return None
        try:
            os.makedirs(CHARTS_DIR, exist_ok=True)
            tmp = chart_cache_path(chart_id) + ".part"
            with open(tmp, "wb") as f:
                f.write(data)
            os.replace(tmp, chart_cache_path(chart_id))
        except OSError as e:
            log("[chart] %s 落盘失败（不影响本次返回）: %s" % (chart_id, e))
        log("[chart] %s 已从远端拉取并缓存（%d 字节）" % (chart_id, len(data)))
        return data
    except Exception as e:
        log("[chart] %s 拉取失败: %s" % (chart_id, e))
        return None


# ---------------------------------------------------------------------------
# 8777：渲染器静态服务
# ---------------------------------------------------------------------------
class RenderHandler(BaseHTTPRequestHandler):
    server_version = "MaiRender/1.0"
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):       # 抑制逐请求噪音
        pass

    def do_GET(self):
        self._handle(send_body=True)

    def do_HEAD(self):
        self._handle(send_body=False)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _plain(self, status, text, ctype="text/plain; charset=utf-8"):
        data = text.encode("utf-8")
        try:
            self.send_response(status)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _send_bytes(self, data, ctype):
        try:
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _send_file(self, full):
        try:
            with open(full, "rb") as f:
                data = f.read()
        except OSError:
            self._plain(404, "not found")
            return
        self._send_bytes(data, MIME.get(ext_of(full), "application/octet-stream"))

    def _handle(self, send_body):
        path = urlsplit(self.path).path
        try:
            path = unquote(path, encoding="utf-8", errors="replace")
        except Exception:
            pass

        # 路径穿越一律 404
        if "\x00" in path or "\\" in path:
            self._plain(404, "not found")
            return
        if any(s == ".." for s in path.split("/") if s):
            self._plain(404, "not found")
            return

        if path == "/healthz":
            self._plain(200, "ok")
            return

        # 谱面：本地优先，缺了去远端拉
        m = CHART_RE.match(path)
        if m:
            chart_id = m.group(1)
            data = read_local_chart(chart_id) or fetch_remote_chart(chart_id)
            if data:
                self._send_bytes(data, "text/plain; charset=utf-8")
            else:
                self._plain(404, "chart not found")
            return

        # 静态文件
        rel = path.lstrip("/")
        if not rel or path.endswith("/"):
            rel = "worker.html"
        full = os.path.realpath(os.path.join(ASSETS_DIR, rel))
        # 再兜一层：解析后必须仍在 assets 目录里
        if not full.startswith(os.path.realpath(ASSETS_DIR) + os.sep):
            self._plain(404, "not found")
            return
        if not os.path.isfile(full):
            self._plain(404, "not found")
            return
        self._send_file(full)


# ---------------------------------------------------------------------------
# 8780：落盘
# ---------------------------------------------------------------------------
class SaveHandler(BaseHTTPRequestHandler):
    server_version = "MaiSave/1.0"
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        pass

    def _json(self, status, obj):
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        try:
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        p = urlsplit(self.path).path
        if p == "/health":
            self._json(200, {"ok": True, "dir": SAVE_DIR, "count": len(list_videos())})
        elif p == "/list":
            files = list_videos()
            self._json(200, {"ok": True, "files": files, "count": len(files)})
        else:
            self._json(404, {"ok": False, "error": "not found"})

    def do_POST(self):
        parts = urlparse(self.path)
        if parts.path != "/save":
            self._json(404, {"ok": False, "error": "not found"})
            return
        q = parse_qs(parts.query)
        name = (q.get("name") or [""])[0].strip()
        chart_id = (q.get("chart_id") or [""])[0].strip()
        diff = (q.get("diff") or [""])[0].strip()

        if not name and chart_id and diff:
            name = "%s_%s.mp4" % (chart_id, diff)
        if not NAME_RE.match(name):
            self._json(400, {"ok": False, "error": "非法文件名: %r" % name})
            return

        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = 0
        if length <= 1024:
            self._json(400, {"ok": False, "error": "body 太小或缺少 Content-Length"})
            return
        if length > MAX_BYTES:
            self._json(413, {"ok": False, "error": "超过单支上限"})
            return

        ensure_save_dir()
        target = os.path.join(SAVE_DIR, name)
        tmp = target + ".part"
        started = time.time()
        written = 0
        try:
            with open(tmp, "wb") as f:
                remain = length
                while remain > 0:
                    chunk = self.rfile.read(min(256 * 1024, remain))
                    if not chunk:
                        break
                    f.write(chunk)
                    written += len(chunk)
                    remain -= len(chunk)
            if written != length:
                raise IOError("只收到 %d / %d 字节" % (written, length))
            os.replace(tmp, target)     # 原子替换：中途断网不会留下半截文件
        except Exception as e:
            try:
                if os.path.isfile(tmp):
                    os.remove(tmp)
            except OSError:
                pass
            log("[save] %s 写入失败: %s" % (name, e))
            self._json(500, {"ok": False, "error": "写入失败: %s" % e})
            return

        ms = int((time.time() - started) * 1000)
        log("[save] %s -> %s (%d 字节, %d ms)" % (name, target, written, ms))
        notified = notify_server(chart_id, diff, name, target, written)
        self._json(200, {
            "ok": True, "path": target, "size": written, "ms": ms, "notified": notified,
        })


# ---------------------------------------------------------------------------
# 启动
# ---------------------------------------------------------------------------
def serve(html_only=False):
    if not os.path.isdir(ASSETS_DIR):
        log("找不到渲染器目录: %s" % ASSETS_DIR)
        log("请把 web/ 下的 worker.html / encoder-worker.js / render-bundle.js / "
            "vendor_mp4_muxer.mjs 放到这个目录（见 README_TERMUX.md）")
        return 2

    # 渲染器静态服务
    try:
        html_srv = ThreadingHTTPServer(("127.0.0.1", HTML_PORT), RenderHandler)
    except OSError as e:
        log("渲染页端口 %d 绑定失败: %s（可能已经有一个实例在跑）" % (HTML_PORT, e))
        return 1
    threading.Thread(target=html_srv.serve_forever, daemon=True).start()
    log("渲染页已启动: http://127.0.0.1:%d/worker.html" % HTML_PORT)
    log("  静态文件目录: %s" % ASSETS_DIR)
    log("  谱面缓存目录: %s" % CHARTS_DIR)

    save_srv = None
    if not html_only:
        try:
            ensure_save_dir()
        except OSError as e:
            log("没有可用的成品目录！请检查权限或配置：%s" % e)
            return 1
        try:
            save_srv = ThreadingHTTPServer(("127.0.0.1", SAVE_PORT), SaveHandler)
        except OSError as e:
            log("落盘端口 %d 绑定失败: %s" % (SAVE_PORT, e))
            return 1
        threading.Thread(target=save_srv.serve_forever, daemon=True).start()
        log("落盘服务已启动: http://127.0.0.1:%d/save  ->  %s"
            % (SAVE_PORT, SAVE_DIR))
        log("  已有成品 %d 支" % len(list_videos()))

    log("按 Ctrl+C 退出")
    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        log("收到中断，退出")
    finally:
        for s in (html_srv, save_srv):
            if s:
                try:
                    s.server_close()
                except Exception:
                    pass
    return 0


def main():
    global SAVE_DIR, HTML_PORT, SAVE_PORT
    ap = argparse.ArgumentParser(description="手机本地渲染页 + 落盘服务")
    ap.add_argument("--dir", default=None, help="成品落盘目录（默认 %s）" % SAVE_DIR)
    ap.add_argument("--html-port", type=int, default=HTML_PORT)
    ap.add_argument("--save-port", type=int, default=SAVE_PORT)
    ap.add_argument("--html-only", action="store_true", help="只起渲染页，不起落盘")
    args = ap.parse_args()

    if args.dir:
        SAVE_DIR = args.dir
    HTML_PORT = args.html_port
    SAVE_PORT = args.save_port
    return serve(html_only=args.html_only)


if __name__ == "__main__":
    sys.exit(main())
