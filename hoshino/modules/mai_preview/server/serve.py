#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""mai_preview 插件自带渲染服务（纯 Python 标准库，无第三方依赖）。
[PATCHED] 相对 preview-demo/serve.py 的改动：谱面根指向插件内 data/，
并通过 data/id2dir.json 把 short_id 映射到曲名文件夹（tools/import_data.py 生成）。

仅绑定 127.0.0.1。路由（接口契约 v1）：

    GET /healthz                     -> 200 text/plain "ok"
    GET /worker.html | /encoder-worker.js | ...  -> server/ 目录下的静态文件
    GET /charts/<id>.txt             -> data/<曲名>/maidata.txt（id 经 id2dir 映射）
    GET /charts/<id>/maidata.txt     -> 同上（兼容写法）

本地缺失的 id 会去远端（ADXDLS，可用环境变量 MAI_PREVIEW_REMOTE 覆盖）懒加载一次，
落盘 data/<曲名>/maidata.txt 并回写 id2dir.json 与 catalog.json，之后离线可复用。

<id> 只接受 [0-9]+，其余一律 404；任何路径穿越尝试（..、反斜杠、%2e%2e）一律 404。

用法：
    python serve.py                 # 默认 127.0.0.1:8777
    python serve.py --port 9000     # 换端口
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import re
import shutil
import socket
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit
from urllib.request import Request, urlopen

DEFAULT_HOST = os.environ.get("MAI_PREVIEW_HOST", "0.0.0.0")
DEFAULT_PORT = 8777
ROOT = os.path.dirname(os.path.abspath(__file__))          # server/
PLUGIN_ROOT = os.path.dirname(ROOT)                        # mai_preview/
DEFAULT_CHART_ROOT = os.path.join(PLUGIN_ROOT, "data")     # 插件内 data/<曲名>/
# short_id -> 曲名文件夹（data/id2dir.json，tools/import_data.py 生成）
ID2DIR: dict = {}
_CATALOG_LITE_CACHE: bytes | None = None

# ---------------- 远端懒加载（本地缺失时按需拉取一次，之后离线可复用） ----------------
REMOTE_CHART_URL = os.environ.get(
    "MAI_PREVIEW_REMOTE", "https://adxdls.saop.cc/adxcs/{id}/maidata.txt"
)
REMOTE_TIMEOUT_S = 8
REMOTE_UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
             "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36")
SLOT_NAME = {2: "Basic", 3: "Advanced", 4: "Expert",
             5: "Master", 6: "Re:Master", 7: "Utage"}
RESERVED = {"CON", "PRN", "AUX", "NUL",
            "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
            "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"}
_write_lock = threading.Lock()


def _safe_name(title: str) -> str:
    """曲名 -> 合法 Windows 文件夹名（与 tools/import_data.py 一致）。"""
    t = re.sub(r'[\\/:*?"<>|\x00-\x1f]', "_", str(title))
    t = t.strip().rstrip(". ")
    if not t:
        t = "_"
    if t.split(".")[0].upper() in RESERVED:
        t = "_" + t
    return t


def _unique_folder(base: str, sid: str, chart_root: str) -> str:
    """大小写不敏感去重（Windows 盘），与现有目录/id2dir 都不冲突。"""
    used = set()
    try:
        used = {v.casefold() for v in ID2DIR.values()}
        used |= {d.casefold() for d in os.listdir(chart_root)
                 if os.path.isdir(os.path.join(chart_root, d))}
    except OSError:
        pass
    cand = f"{base}__{sid}"
    name, i = base, 1
    while name.casefold() in used:
        name = cand if i == 1 else f"{cand}_{i}"
        i += 1
    return name


def _lazy_fetch(chart_id: str, chart_root: str) -> str | None:
    """本地缺失 -> 去 ADX 拉谱，落盘 data/<曲名>/maidata.txt 并补 id2dir/catalog。

    成功返回该曲目录；失败返回 None（调用方回 404）。
    """
    url = REMOTE_CHART_URL.format(id=chart_id)
    try:
        req = Request(url, headers={"User-Agent": REMOTE_UA, "Accept": "*/*"})
        with urlopen(req, timeout=REMOTE_TIMEOUT_S) as resp:
            raw = resp.read()
    except Exception as exc:
        print(f"  远端懒加载失败 {chart_id}: {exc}", file=sys.stderr)
        return None
    text = raw.decode("utf-8", errors="replace")
    if "&title=" not in text[:4000] and "&lv_" not in text[:4000]:
        print(f"  远端懒加载 {chart_id}: 响应不是 maidata，已拒收", file=sys.stderr)
        return None
    m = re.search(r"^&title=(.+)$", text, re.M)
    title = (m.group(1).strip() if m else "") or chart_id
    folder = ID2DIR.get(chart_id) or _unique_folder(_safe_name(title), chart_id, chart_root)
    target_dir = os.path.join(chart_root, folder)
    try:
        os.makedirs(target_dir, exist_ok=True)
        with open(os.path.join(target_dir, "maidata.txt"), "wb") as fh:
            fh.write(raw)
    except OSError as exc:
        print(f"  远端懒加载落盘失败 {chart_id}: {exc}", file=sys.stderr)
        return None
    with _write_lock:
        ID2DIR[chart_id] = folder
        try:
            with open(os.path.join(chart_root, "id2dir.json"), "w", encoding="utf-8") as fh:
                json.dump(ID2DIR, fh, ensure_ascii=False, indent=0)
        except OSError as exc:
            print(f"警告：id2dir.json 回写失败 {chart_id}: {exc}", file=sys.stderr)
        _catalog_add(chart_id, title, text, chart_root)
    print(f"  远端懒加载 OK {chart_id} -> {folder}（{len(raw)} B）", flush=True)
    return target_dir


def _catalog_add(chart_id: str, title: str, text: str, chart_root: str) -> None:
    """把懒加载到的新曲补进 data/catalog.json（标题/难度槽位），bot 端无需重启即可查。"""
    path = os.path.join(chart_root, "catalog.json")
    if not os.path.isfile(path):
        return
    try:
        with open(path, encoding="utf-8") as fh:
            cat = json.load(fh)
        entries = cat.setdefault("entries", [])
        if any(str(e.get("short_id")) == chart_id for e in entries):
            return
        diffs = []
        for m in re.finditer(r"^&lv_(\d+)=(.+)$", text, re.M):
            try:
                slot = int(m.group(1))
            except ValueError:
                continue
            level = m.group(2).split("//")[0].strip()
            diffs.append({"slot": slot, "name": SLOT_NAME.get(slot, f"lv_{slot}"),
                          "level": level, "designer": "", "notes": 0})
        diffs.sort(key=lambda d: d["slot"])
        entries.append({"short_id": chart_id, "title": title, "aliases": [],
                        "difficulties": diffs, "files": {}})
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(cat, fh, ensure_ascii=False)
        print(f"  目录已补条目 {chart_id}《{title}》", flush=True)
    except Exception as exc:
        print(f"警告：catalog.json 补写失败 {chart_id}: {exc}", file=sys.stderr)

# /charts/<id>.txt 与 /charts/<id>/<asset> 支持
CHART_ASSET_RE = re.compile(r"^/charts/([0-9]+)(?:/([a-zA-Z0-9_\-\.]+)|(?:\.txt))?$")

CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".map": "application/json; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/plain; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".wasm": "application/wasm",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".m4a": "audio/mp4",
}


def guess_type(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    if ext in CONTENT_TYPES:
        return CONTENT_TYPES[ext]
    guessed, _ = mimetypes.guess_type(path)
    return guessed or "application/octet-stream"


def resolve_inside(base: str, rel: str) -> str | None:
    """把 rel 解析到 base 之内；越界返回 None。"""
    base_real = os.path.realpath(base)
    full = os.path.realpath(os.path.join(base_real, rel))
    if full == base_real or full.startswith(base_real + os.sep):
        return full
    return None


class PreviewHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "preview-demo/1.0"
    chart_root = DEFAULT_CHART_ROOT

    # ---------- 日志 ----------
    def log_message(self, fmt: str, *args) -> None:  # noqa: A003
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    # ---------- 方法分发 ----------
    def do_GET(self) -> None:  # noqa: N802
        self._handle(send_body=True)

    def do_HEAD(self) -> None:  # noqa: N802
        self._handle(send_body=False)

    def _reject_method(self) -> None:  # noqa: N802
        self._plain(405, "method not allowed")

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlsplit(self.path)
        if parsed.path == "/api/save_raw":
            try:
                from urllib.parse import parse_qs
                qs = parse_qs(parsed.query)
                name = qs.get("name", ["raw_video.mp4"])[0]
                # 限制文件名
                name = re.sub(r'[\\/:*?"<>|\x00-\x1f]', '_', name)
                out_dir = os.path.join(ROOT, "output")
                os.makedirs(out_dir, exist_ok=True)
                target = os.path.join(out_dir, name)
                length = int(self.headers.get("Content-Length", 0))
                remaining = length
                with open(target, "wb") as f:
                    while remaining > 0:
                        chunk = self.rfile.read(min(remaining, 64 * 1024))
                        if not chunk:
                            break
                        f.write(chunk)
                        remaining -= len(chunk)
                res = json.dumps({"ok": True, "path": target, "bytes": os.path.getsize(target)})
                self._plain(200, res, "application/json")
                return
            except Exception as e:
                self._plain(500, json.dumps({"ok": False, "error": str(e)}), "application/json")
                return
        self._reject_method()
    do_PUT = _reject_method
    do_DELETE = _reject_method
    do_PATCH = _reject_method

    def do_OPTIONS(self) -> None:  # noqa: N802
        """支持 CORS 预检请求。"""
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Content-Length", "0")
        self.end_headers()

    # ---------- 应答工具 ----------
    def _plain(self, status: int, text: str, ctype: str = "text/plain; charset=utf-8") -> None:
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

    def _send_file(self, full: str) -> None:
        try:
            size = os.path.getsize(full)
            self.send_response(200)
            self.send_header("Content-Type", guess_type(full))
            self.send_header("Content-Length", str(size))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            if self.command == "HEAD":
                return
            with open(full, "rb") as fh:
                shutil.copyfileobj(fh, self.wfile, length=64 * 1024)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _send_catalog_lite(self) -> None:
        """为移动端提供精简版曲目目录（~150KB），加快手机浏览器加载速度。"""
        global _CATALOG_LITE_CACHE
        with _write_lock:
            if _CATALOG_LITE_CACHE is None:
                full = resolve_inside(self.chart_root, "catalog.json")
                if not full or not os.path.isfile(full):
                    self._plain(404, "catalog not found")
                    return
                try:
                    with open(full, encoding="utf-8") as fh:
                        cat = json.load(fh)
                    lite = []
                    for e in cat.get("entries", []):
                        diffs = []
                        for d in e.get("difficulties", []):
                            diffs.append({"slot": d.get("slot"), "name": d.get("name"), "level": d.get("level")})
                        lite.append({
                            "id": str(e.get("short_id") or ""),
                            "title": e.get("title", ""),
                            "artist": e.get("artist", ""),
                            "bpm": e.get("bpm", 0),
                            "diffs": diffs
                        })
                    _CATALOG_LITE_CACHE = json.dumps(lite, ensure_ascii=False).encode("utf-8")
                except Exception as exc:
                    self._plain(500, f"failed to load catalog: {exc}")
                    return
        data = _CATALOG_LITE_CACHE
        try:
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    # ---------- 路由 ----------
    def _handle(self, send_body: bool) -> None:
        raw_path = urlsplit(self.path).path
        try:
            path = unquote(raw_path, encoding="utf-8", errors="replace")
        except Exception:
            path = raw_path

        # 路径穿越 / 异常字符一律 404（含 %2e%2e、反斜杠、NUL）
        if "\x00" in path or "\\" in path:
            self._plain(404, "not found")
            return
        segments = [s for s in path.split("/") if s != ""]
        if any(s == ".." for s in segments):
            self._plain(404, "not found")
            return

        # 1) 健康检查
        if path == "/healthz":
            self._plain(200, "ok")
            return

        # 2) 谱面与资源路由（short_id 经 id2dir.json 映射到曲名文件夹）
        m = CHART_ASSET_RE.match(path)
        if m:
            chart_id = m.group(1)
            filename = m.group(2) or "maidata.txt"
            rel_dir = ID2DIR.get(chart_id, chart_id)
            full = resolve_inside(self.chart_root, os.path.join(rel_dir, filename))
            if full and os.path.isfile(full):
                self._send_file(full)
                return
            # 只有 maidata.txt 缺失才触发懒加载
            if filename == "maidata.txt":
                target_dir = _lazy_fetch(chart_id, self.chart_root)
                if target_dir:
                    self._send_file(os.path.join(target_dir, "maidata.txt"))
                    return
            self._plain(404, "not found")
            return

        # 3) 曲目元数据路由（提供 catalog.json 与移动端专用的 catalog-lite.json）
        if path == "/catalog.json":
            full = resolve_inside(self.chart_root, "catalog.json")
            if full and os.path.isfile(full):
                self._send_file(full)
            else:
                self._plain(404, "not found")
            return
        if path == "/catalog-lite.json":
            self._send_catalog_lite()
            return

        # 4) 静态文件（server 目录，含 worker.html / encoder-worker.js / render-bundle.js / vendor_mp4_muxer.mjs）
        rel = path.lstrip("/")
        if path.endswith("/") or rel == "":
            rel = os.path.join(rel, "index.html")
        full = resolve_inside(ROOT, rel)
        if full is None:
            self._plain(404, "not found")
            return
        if os.path.isdir(full):
            full = os.path.join(full, "index.html")
        if not os.path.isfile(full):
            self._plain(404, "not found")
            return
        self._send_file(full)


def _get_local_ips() -> list[str]:
    """探测本机所有可用的局域网 IP 地址，便于提示手机访问。"""
    ips = []
    try:
        hostname = socket.gethostname()
        for ip in socket.gethostbyname_ex(hostname)[2]:
            if not ip.startswith("127."):
                ips.append(ip)
    except Exception:
        pass
    return ips or ["127.0.0.1"]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="mai_preview 渲染与手机录制服务")
    parser.add_argument("--host", default=DEFAULT_HOST, help=f"监听地址（默认 {DEFAULT_HOST}）")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"监听端口（默认 {DEFAULT_PORT}）")
    parser.add_argument(
        "--charts-root",
        default=DEFAULT_CHART_ROOT,
        help="谱面根目录（默认 %s）" % DEFAULT_CHART_ROOT,
    )
    parser.add_argument("--quiet", action="store_true", help="不打印每个请求日志")
    args = parser.parse_args(argv)

    chart_root = os.path.realpath(args.charts_root)
    PreviewHandler.chart_root = chart_root
    id_map = os.path.join(chart_root, "id2dir.json")
    if os.path.isfile(id_map):
        try:
            with open(id_map, encoding="utf-8") as fh:
                ID2DIR.update(json.load(fh))
            print(f"  id2dir 映射: {len(ID2DIR)} 条（{id_map}）", flush=True)
        except Exception as exc:
            print(f"警告：id2dir.json 读取失败：{exc}", file=sys.stderr)
    if args.quiet:
        PreviewHandler.log_message = lambda self, fmt, *a: None  # type: ignore[assignment]

    bind_host = args.host
    try:
        httpd = ThreadingHTTPServer((bind_host, args.port), PreviewHandler)
    except OSError as exc:
        print(f"无法监听 {bind_host}:{args.port}: {exc}", file=sys.stderr)
        return 1
    httpd.daemon_threads = True

    port = httpd.server_address[1]
    local_ips = _get_local_ips()
    print("=" * 60, flush=True)
    print(f"  mai_preview 服务已启动: http://{bind_host}:{port}/", flush=True)
    print(f"  静态根目录: {ROOT}", flush=True)
    print(f"  谱面根目录: {chart_root}", flush=True)
    print("  手机常驻渲染工作页（部署时在手机 Chrome 打开并保持常驻）:", flush=True)
    for lip in local_ips:
        print(f"    -> http://{lip}:{port}/worker.html", flush=True)
    print(f"  健康检查:     http://127.0.0.1:{port}/healthz", flush=True)
    print("=" * 60, flush=True)
    try:
        httpd.serve_forever(poll_interval=0.2)
    except KeyboardInterrupt:
        print("\n已停止", flush=True)
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
