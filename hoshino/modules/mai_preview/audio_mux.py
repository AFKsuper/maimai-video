# -*- coding: utf-8 -*-
"""给手机渲染出来的无声成片补上音轨。

== 为什么需要这一步 ==

手机端逐帧编码用的是浏览器 WebCodecs 的 ``VideoEncoder``，
``encoder-worker.js`` 里只 ``addVideoChunk``、从头到尾没有 ``AudioEncoder``
（也没 ``decodeAudioData`` / ``AudioContext``），所以手机产出的 MP4 天生
**只有一条 h264 视频流，没有音轨**。这不是 bug 而是当初只做了画面。

谱面预览发到群里，用户第一反应是「怎么没声音」。补音轨的动作放在
**服务器入库时**做，理由：

- 手机端要做就得在 Worker 里解码 mp3 + 编 AAC，Termux/Chrome 的
  WebCodecs 音频支持在移动端并不稳定，而且会让本来 40 秒的渲染再慢一截；
- 服务器已经有 ffmpeg（``video_verify`` 本来就在用 ffprobe 探时长），
  一条 ``-c:v copy`` 的命令 4 秒就能搞定，不重新编码画面、不损画质；
- 音轨来源是 ``catalog.json`` 里的 ``media.audio_url``（谱面数据源自带），
  服务器下载一次就能缓存复用。

== 关键设计 ==

1. **画面一个字节都不动**：``-map 0:v:0 -map 1:a:0 -c:v copy``，
   所以时长、帧数、分辨率与手机渲染出来的完全一致（实测 266 曲 5296 帧
   / 88.266667s 补音轨前后相同）。这一点很重要 —— ``video_verify`` 是按
   时长的比值判合格的，万一补音轨改了时长就会把好片判成坏片。
2. **不加 ``-shortest``**：音频一般比视频略短（曲子末尾自然收尾），加了
   ``-shortest`` 反而会把视频截短。容器时长取最长的那条流，仍等于视频时长。
3. **失败绝不影响主链路**：没网、源站挂了、ffmpeg 不在，都只是「这支没声音」，
   视频照常入库发群。无声视频比没有视频好得多，所以这里一律返回失败原因而
   不抛异常。
4. **原子替换**：ffmpeg 先写到同目录 ``.part`` 临时文件，成功后再 ``os.replace``。
   中途失败不会留下半截文件被后续当成成品。

== 对外使用方 ==

``phone_bridge.py`` 的 ``handle_upload``（手机回传成品入库时调用）。
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import threading
import urllib.request
from typing import Any, Dict, Optional, Tuple


# ---------------------------------------------------------------- 配置读取


def _cfg(name: str, default: Any = None) -> Any:
    """读 config 的一个键，兼容「包内导入」与「脚本直跑」两种加载方式。

    与 ``video_verify._cfg_attr`` 同一套降级思路：包内导入失败就退回
    ``import config``，再失败返回 default，保证裸环境下也能 import 本模块。
    """
    try:
        from . import config as cfg
        return getattr(cfg, name, default)
    except Exception:
        try:
            import config as cfg
            return getattr(cfg, name, default)
        except Exception:
            return default


def _here() -> str:
    return os.path.dirname(os.path.abspath(__file__))


# ---------------------------------------------------------------- ffmpeg 定位

_FFMPEG_CACHE: Dict[str, Optional[str]] = {}
_FFMPEG_LOCK = threading.Lock()


def find_ffmpeg() -> Optional[str]:
    """探测 ffmpeg 可执行文件，结果缓存在进程内。

    顺序与 ``video_verify.find_ffprobe`` 保持一致，避免两处各自找到不同版本：
    ① ``config.FFMPEG`` 本身；② 同目录的 ffmpeg.exe；③ PATH；④ winget 安装目录。
    """
    with _FFMPEG_LOCK:
        if "v" in _FFMPEG_CACHE:
            return _FFMPEG_CACHE["v"]

        found: Optional[str] = None

        cand = _cfg("FFMPEG", "") or ""
        if cand and os.path.isfile(cand):
            found = cand
        if not found:
            found = shutil.which("ffmpeg")
        if not found:
            pkgs = os.path.join(os.environ.get("LOCALAPPDATA", ""),
                                "Microsoft", "WinGet", "Packages")
            if os.path.isdir(pkgs):
                import glob
                hits = sorted(glob.glob(os.path.join(pkgs, "*ffmpeg*", "*", "bin", "ffmpeg.exe")))
                if not hits:
                    hits = sorted(glob.glob(
                        os.path.join(pkgs, "*ffmpeg*", "**", "ffmpeg.exe"), recursive=True))
                if hits:
                    found = hits[0]

        _FFMPEG_CACHE["v"] = found
        return found


# ---------------------------------------------------------------- 音轨来源

_CATALOG_LOCK = threading.Lock()
_CATALOG: Dict[str, Any] = {}


def _load_catalog() -> Dict[str, Any]:
    """加载 catalog.json，按 (mtime, size) 缓存，文件换了会自动重读。"""
    path = _cfg("CATALOG_JSON", "") or ""
    if not path:
        path = os.path.join(_here(), "data", "catalog.json")
    if not os.path.isfile(path):
        return {}

    try:
        st = os.stat(path)
        key = (st.st_mtime, st.st_size)
    except OSError:
        key = None

    with _CATALOG_LOCK:
        if _CATALOG.get("key") == key and key is not None:
            return _CATALOG.get("data") or {}
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            return {}
        _CATALOG["key"] = key
        _CATALOG["data"] = data
        return data


def catalog_audio_url(chart_id: str | int) -> Optional[str]:
    """从 catalog 里取该曲目的音轨地址（拿不到返回 None）。

    两处都试：``media.audio_url`` 优先（这是数据源给播放器用的地址），
    其次 ``files.audio``。任一为空就跳过。
    """
    data = _load_catalog()
    entries = data.get("entries") if isinstance(data, dict) else None
    if not entries:
        return None

    want = str(chart_id).strip()
    for e in entries:
        if not isinstance(e, dict):
            continue
        if str(e.get("slug") or "").strip() != want and str(e.get("id") or "").strip() != want:
            continue
        media = e.get("media") or {}
        files = e.get("files") or {}
        for url in (media.get("audio_url"), files.get("audio")):
            if isinstance(url, str) and url.strip():
                return url.strip()
        return None
    return None


def catalog_timing_delay_ms(chart_id: str | int) -> int:
    """计算该曲目音轨前置所需延时（毫秒），使音频第1拍与画面首音符判定点精准重合。"""
    data = _load_catalog()
    entries = data.get("entries") if isinstance(data, dict) else None
    if not entries:
        return 0
    want = str(chart_id).strip()
    for e in entries:
        if not isinstance(e, dict):
            continue
        if str(e.get("slug") or "").strip() != want and str(e.get("id") or "").strip() != want:
            continue
        try:
            bpm = float(e.get("bpm") or 0)
            offset = float(e.get("offset") or 0) # 秒
            if bpm > 0:
                lead_in_ms = (60000.0 * 4.0) / bpm
                first_ms = offset * 1000.0
                return max(0, int(round(lead_in_ms - first_ms)))
        except (ValueError, TypeError):
            pass
    return 0


# ---------------------------------------------------------------- 音频缓存


def _audio_cache_dir() -> str:
    d = _cfg("AUDIO_CACHE_DIR", "") or os.path.join(_here(), "cache", "audio")
    os.makedirs(d, exist_ok=True)
    return d


def _audio_cached_path(chart_id: str | int) -> str:
    return os.path.join(_audio_cache_dir(), "%s.mp3" % str(chart_id).strip())


def fetch_audio(chart_id: str | int, timeout: Optional[float] = None) -> Tuple[Optional[str], str]:
    """确保该曲目的音轨已下载到本地缓存，返回 (路径, 原因)。

    下载成功就留在 ``cache/audio/<id>.mp3``，下次同一首直接复用 —— 一首曲子
    通常会被不同难度反复请求，没必要每次都回源站拉一遍。
    """
    cached = _audio_cached_path(chart_id)
    if os.path.isfile(cached) and os.path.getsize(cached) > 1024:
        return cached, "cache_hit"

    url = catalog_audio_url(chart_id)
    if not url:
        return None, "no_audio_url"

    if timeout is None:
        timeout = float(_cfg("PHONE_AUDIO_TIMEOUT_S", 60) or 60)

    tmp = cached + ".downloading"
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (maimai-video/audio-mux)",
            "Accept": "*/*",
        })
        with urllib.request.urlopen(req, timeout=timeout) as resp:  # noqa: S310 (固定数据源)
            with open(tmp, "wb") as f:
                shutil.copyfileobj(resp, f)
        if os.path.getsize(tmp) <= 1024:
            os.remove(tmp)
            return None, "audio_too_small"
        os.replace(tmp, cached)
        return cached, "downloaded"
    except Exception as exc:
        try:
            if os.path.exists(tmp):
                os.remove(tmp)
        except OSError:
            pass
        return None, "download_error: %s" % exc


# ---------------------------------------------------------------- 核心：补音轨


def has_audio_stream(video_path: str) -> Optional[bool]:
    """判断视频里是否已有音轨（True/False，探测不了返回 None）。

    这是幂等性的关键：已经带音轨的成片（比如用户自己上传的）不该被再补一遍。
    这里复用 ``video_verify`` 里已经探测好的 ffprobe，不重复找二进制。
    """
    try:
        from . import video_verify
    except Exception:
        try:
            import video_verify
        except Exception:
            return None

    ffprobe = video_verify.find_ffprobe()
    if not ffprobe:
        return None
    try:
        out = subprocess.run(
            [ffprobe, "-v", "error", "-select_streams", "a",
             "-show_entries", "stream=index", "-of", "csv=p=0", video_path],
            capture_output=True, text=True, timeout=30,
        )
    except Exception:
        return None
    if out.returncode != 0:
        return None
    return bool((out.stdout or "").strip())


def apply_audio(
    video_path: str,
    chart_id: str | int,
    *,
    force: bool = False,
    timeout: Optional[float] = None,
) -> Tuple[bool, str, Dict[str, Any]]:
    """给 ``video_path`` 补上 ``chart_id`` 对应曲目的音轨（就地替换）。

    返回 ``(是否已带上音轨, 原因, 详情)``。原因取值：

      already_has_audio  本来就有音轨，没动文件
      disabled           配置里关了（``PHONE_AUDIO_MUX_ENABLED = False``）
      no_ffmpeg          找不到 ffmpeg
      no_audio_url       catalog 里这首没有音轨地址
      download_failed    音轨下载失败
      mux_failed         ffmpeg 合成失败
      muxed              成功补上
      skipped            force=False 且文件不存在／太小，不去动它

    **任何失败都返回 False 而不抛异常** —— 调用方据此只记一条日志，
    视频该怎么入库还怎么入库。
    """
    info: Dict[str, Any] = {}

    if not os.path.isfile(video_path):
        return False, "skipped", info

    if not force:
        existing = has_audio_stream(video_path)
        if existing is True:
            return True, "already_has_audio", info

    if not bool(_cfg("PHONE_AUDIO_MUX_ENABLED", True)):
        return False, "disabled", info

    ffmpeg = find_ffmpeg()
    if not ffmpeg:
        return False, "no_ffmpeg", info
    info["ffmpeg"] = ffmpeg

    audio, fetch_reason = fetch_audio(chart_id, timeout=timeout)
    info["audio_fetch"] = fetch_reason
    if not audio:
        return False, "download_failed" if "download_error" in fetch_reason else fetch_reason, info
    info["audio"] = audio

    if timeout is None:
        timeout = float(_cfg("PHONE_AUDIO_TIMEOUT_S", 60) or 60)
    # ffmpeg 要读整条音轨再封装，超时给得比下载宽一些，但也必须有上限，
    # 否则一条坏文件能把入库线程永久挂住。
    run_timeout = max(60.0, float(timeout) * 3)

    part = video_path + ".muxing.mp4"
    bitrate = str(_cfg("PHONE_AUDIO_BITRATE", "128k") or "128k")
    delay_ms = catalog_timing_delay_ms(chart_id)
    filter_complex = f"[1:a]adelay={delay_ms}|{delay_ms},apad[a]" if delay_ms > 0 else "[1:a]apad[a]"
    cmd = [
        ffmpeg, "-y", "-v", "error",
        "-i", video_path,
        "-i", audio,
        "-filter_complex", filter_complex,
        "-map", "0:v:0", "-map", "[a]",
        "-c:v", "copy",            # 画面直接透传，不重编码、不损画质
        "-c:a", "aac", "-b:a", bitrate,
        "-shortest",
        "-movflags", "+faststart",
        part,
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, timeout=run_timeout)
    except subprocess.TimeoutExpired:
        _cleanup(part)
        return False, "mux_failed", dict(info, error="timeout")
    except Exception as exc:
        _cleanup(part)
        return False, "mux_failed", dict(info, error=str(exc))

    if proc.returncode != 0 or not os.path.isfile(part) or os.path.getsize(part) <= 1024:
        err = (proc.stderr or b"").decode("utf-8", "replace").strip()[:300]
        _cleanup(part)
        return False, "mux_failed", dict(info, error=err or ("exit=%s" % proc.returncode))

    try:
        os.replace(part, video_path)
    except Exception as exc:
        _cleanup(part)
        return False, "mux_failed", dict(info, error="replace: %s" % exc)

    info["size"] = os.path.getsize(video_path)
    return True, "muxed", info


def _cleanup(path: str) -> None:
    try:
        if os.path.exists(path):
            os.remove(path)
    except OSError:
        pass
