# -*- coding: utf-8 -*-
"""MP4 成品校验：确保「全曲」请求不会把残缺短片当成成品发进 QQ 群。

== 背景（为什么需要这个模块）==
手机端预录库里可能残留早期的短测试片：例如 `11879_5.mp4` 只有 10 秒，
而该谱面全曲为 162.5 秒。服务器早期只判断「文件存在且 > 1024 字节」就
当成成品，结果把 10 秒测试片当作全曲转发到群里。

== 校验策略 ==
1. 期望时长（权威来源）= `data/catalog.json` 的 `difficulties[].duration_ms`，
   缺失时退回条目级 `duration_ms`。
2. 实测时长 = ffprobe 读取的容器时长（秒 → 毫秒）。
3. 比值 `real / expected` 必须落在 `[MIN_RATIO, MAX_RATIO]`，默认 `[0.75, 1.35]`。
   实测参考值（本机真实数据）：
     - `12059_5.mp4` 正常全曲：catalog 144677ms / 实测 147100ms → 比值 1.017 ✓
     - `11879_5.mp4` 残缺测试片：catalog 162499ms / 实测 10000ms → 比值 0.062 ✗
   渲染时长与音频时长存在约 1~2% 的自然差异（渲染会多出开头/结尾停留），
   所以容差不能贴太紧；0.75 对残缺片有 12 倍余量，足够安全。
4. 校验结果写同名 sidecar `<file>.meta.json`，避免每次请求都跑 ffprobe。
   sidecar 只在「catalog 期望时长未变」且「文件字节数未变」时才可复用，
   任一变化都会强制重验（文件被替换过就要重新判定）。
5. 不合格文件不静默删除，移入 `cache/mp4/rejected/` 并记录原因，便于排查。

== 降级行为与 strict 语义 ==
如果探测不到 ffprobe，或 catalog 里没有该曲目的时长：
- `strict=False`（默认，读取既有缓存时用）：返回 `ok=True, reason="skipped"`
  —— 不能因为校验工具缺失就彻底阻断业务，但会在日志里留痕；
- `strict=True`（上传入库路径必须用）：fail-closed，凡「无法判定」的情形
  （catalog 查不到时长 → `no_reference`、没有 ffprobe → `no_ffprobe`）一律判为
  不通过，而不是放行。否则守门会因为一个环境问题静默失效，残缺视频照样能发进群。
  读取既有缓存时用 strict=False，避免环境异常导致整库缓存被误隔离。

reason 全集：`ok` / `skipped` / `too_short` / `too_long` / `unreadable` /
`missing` / `no_reference` / `no_ffprobe`。

对外使用方：phone_bridge.py（verify_mp4 / quarantine）、_test_vv.py、_test_gate.py。
"""
from __future__ import annotations

import glob
import io
import json
import os
import shutil
import subprocess
import sys
import time
from typing import Any, Dict, Optional, Tuple

# 比值容差：实测正常值 1.017，残缺值 0.062，取 0.75 作为下限有充足余量
MIN_RATIO = 0.75
MAX_RATIO = 1.35

# ffprobe 探测结果缓存（进程内），避免每次调用都扫盘
_FFPROBE_CACHE: Dict[str, Optional[str]] = {}
# catalog 时长缓存
_CATALOG_CACHE: Dict[str, Any] = {}


# ---------------------------------------------------------------- 基础设施


def _cfg_attr(name: str, default: str = "") -> Any:
    """读 config 的一个键，兼容「包内导入」与「脚本直跑」两种加载方式。

    两级降级：``from . import config`` 失败 -> ``import config`` -> 再失败返回
    default。任何异常都吞掉，保证本模块在缺 config 的裸环境也能工作。
    """
    try:
        from . import config as cfg  # 包内导入
        return getattr(cfg, name, default) or default
    except Exception:
        try:
            import config as cfg  # 直接以脚本方式运行时的降级
            return getattr(cfg, name, default) or default
        except Exception:
            return default


def find_ffprobe() -> Optional[str]:
    """探测 ffprobe：优先与 config.FFMPEG 同目录，其次 PATH，最后 winget 目录。

    为什么优先同目录：用户可能把 ffmpeg 解压到自定义位置，此时同目录的
    ffprobe 才是最匹配的那个版本，避免版本混用导致解析差异。

    结果（含「没找到」）缓存在进程内，重复调用不重复扫盘。
    """
    if "" in _FFPROBE_CACHE:
        return _FFPROBE_CACHE[""]

    found: Optional[str] = None

    # 1. 与 config.FFMPEG 同目录
    cand = _cfg_attr("FFMPEG")
    if cand and os.path.isfile(cand):
        sibling = os.path.join(os.path.dirname(cand), "ffprobe.exe")
        if os.path.isfile(sibling):
            found = sibling
        else:
            # 同名可执行文件（非 Windows 或自定义命名）
            sibling2 = os.path.join(os.path.dirname(cand), "ffprobe")
            if os.path.isfile(sibling2):
                found = sibling2

    # 2. PATH
    if not found:
        found = shutil.which("ffprobe")

    # 3. winget 默认安装目录（与 render_core.find_ffmpeg 保持一致的思路）
    if not found:
        pkgs = os.path.join(os.environ.get("LOCALAPPDATA", ""),
                            "Microsoft", "WinGet", "Packages")
        if os.path.isdir(pkgs):
            hits = sorted(glob.glob(os.path.join(pkgs, "*ffmpeg*", "*", "bin", "ffprobe.exe")))
            if not hits:
                hits = sorted(glob.glob(os.path.join(pkgs, "*ffmpeg*", "**", "ffprobe.exe"),
                                        recursive=True))
            if hits:
                found = hits[0]

    _FFPROBE_CACHE[""] = found
    return found


# ---------------------------------------------------------------- catalog 期望时长


def _catalog_path() -> Optional[str]:
    """定位 catalog.json（不存在返回 None）。"""
    here = _cfg_attr("HERE")
    if not here:
        here = os.path.dirname(os.path.abspath(__file__))
    p = os.path.join(here, "data", "catalog.json")
    return p if os.path.isfile(p) else None


def _load_catalog() -> Dict[str, Any]:
    """载入并缓存 catalog.json 的 entries 列表（按 short_id/slug 索引）。"""
    if "entries" in _CATALOG_CACHE:
        return _CATALOG_CACHE

    entries: Dict[str, Dict[str, Any]] = {}
    path = _catalog_path()
    if path:
        try:
            with io.open(path, encoding="utf-8") as fh:
                data = json.load(fh)
            for e in data.get("entries", []):
                sid = str(e.get("short_id") or e.get("slug") or "").strip()
                if sid:
                    entries[sid] = e
        except Exception as exc:  # 读失败不应让业务崩，只是退回「不校验」
            print(f"[video_verify] 读取 catalog 失败，时长校验将跳过: {exc}", file=sys.stderr)

    _CATALOG_CACHE["entries"] = entries
    return _CATALOG_CACHE


def catalog_duration_ms(chart_id: str | int, diff: Optional[int] = None) -> Optional[int]:
    """从 catalog.json 查该谱面的期望时长（毫秒）。

    优先取对应难度的 duration_ms；没有该难度或该字段时退回条目级 duration_ms。
    查不到返回 None。
    """
    entries = _load_catalog().get("entries") or {}
    e = entries.get(str(chart_id).strip())
    if not e:
        return None

    if diff is not None:
        for d in e.get("difficulties") or []:
            try:
                if int(d.get("slot")) == int(diff):
                    v = d.get("duration_ms")
                    if isinstance(v, (int, float)) and v > 0:
                        return int(v)
                    break  # 槽位命中但该难度没有时长 -> 退回条目级
            except (TypeError, ValueError):
                continue

    v = e.get("duration_ms")
    if isinstance(v, (int, float)) and v > 0:
        return int(v)
    return None


# ---------------------------------------------------------------- 实测时长


def probe_duration_ms(path: str, timeout: int = 30) -> Optional[int]:
    """用 ffprobe 读取 MP4 容器时长（毫秒）。失败返回 None。"""
    ffprobe = find_ffprobe()
    if not ffprobe or not os.path.isfile(path):
        return None
    try:
        r = subprocess.run(
            [ffprobe, "-v", "error", "-show_entries", "format=duration",
             "-of", "json", path],
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=timeout,
        )
        out = r.stdout.decode("utf-8", "replace").strip()
        # ffprobe 的 JSON 里 duration 是字符串形式的秒
        start = out.find("{")
        if start < 0:
            return None
        j = json.loads(out[start:])
        dur = j.get("format", {}).get("duration")
        if dur is None:
            return None
        return int(round(float(dur) * 1000))
    except Exception:
        return None


# ---------------------------------------------------------------- sidecar（判定结果复用）


def _meta_path(video_path: str) -> str:
    return video_path + ".meta.json"


def _read_meta(video_path: str) -> Optional[Dict[str, Any]]:
    """读 sidecar，只在它确实是「一个 JSON 对象」时才返回。

    这里必须挡住「合法 JSON 但不是 dict」的情形（`[1,2]` / `"x"` / `123`）。
    否则调用方 `_reuse_meta` 的 `if not meta` 挡不住非空 list，
    紧接着 `meta.get(...)` 会抛 AttributeError —— 读缓存路径有 try/except
    兜底，而那条兜底是 fail-open，等于让一个坏 sidecar 把守门整个绕过。
    """
    p = _meta_path(video_path)
    if not os.path.isfile(p):
        return None
    try:
        with io.open(p, encoding="utf-8") as fh:
            data = json.load(fh)
    except Exception:
        return None
    return data if isinstance(data, dict) else None


def _write_meta(video_path: str, meta: Dict[str, Any]) -> None:
    try:
        with io.open(_meta_path(video_path), "w", encoding="utf-8") as fh:
            fh.write(json.dumps(meta, ensure_ascii=False, indent=1))
    except Exception:
        pass


def _same_size(a: int, b: int) -> bool:
    """尺寸一致才认为 sidecar 记录仍然有效（文件被替换过就要重验）。"""
    return a == b


def _reuse_meta(meta: Optional[Dict[str, Any]],
                expected: int, size: int,
                video_path: str = "") -> Optional[Tuple[bool, str, Dict[str, Any]]]:
    """sidecar 仍有效（期望时长与文件尺寸都没变）时返回 (ok, reason, meta)。

    字段类型不对（例如 size 是个 dict、expected_ms 是字符串）时一律当作
    「不可复用」返回 None，让调用方重新用 ffprobe 实测。绝不能在这里抛异常：
    读缓存路径外面是 fail-open 的兜底，一抛就等于把守门让开了。

    ---- 已知且接受的信任边界（不要误当成漏洞来修）----
    sidecar 是被信任的：一份「内容自洽」的伪造 sidecar（ok=true、expected_ms 与
    文件实际 size 都填对、ratio 也在区间内）能让一个残片通过校验。

    为什么接受：伪造它需要已经拥有 cache/mp4/ 的写权限，而有写权限的人本来就能
    直接把残片改名成正式文件、或把 sidecar 删掉绕开一切复用逻辑 —— 这不构成新的
    提权路径，只是「本地缓存目录属于可信区域」这个既有前提的推论。

    真正被本函数挡住的是「非对抗性」的坏数据：半写入的 sidecar、外部编辑写成了
    字符串布尔、字段类型被改坏、判定之后文件又被等大文件换过 —— 这些一律返回
    None 触发重测，而不是拿去判案。
    """
    if not isinstance(meta, dict):
        return None
    try:
        if meta.get("expected_ms") != expected:
            return None
        if not _same_size(int(meta.get("size") or -1), size):
            return None
        # 视频文件的 mtime 晚于 sidecar → 判定之后文件又被动过（例如被等大的另一个
        # 文件替换，尺寸比对看不出来）。这种情况必须重测，不能吃旧结论。
        if video_path:
            mp = _meta_path(video_path)
            if os.path.isfile(mp) and os.path.getmtime(video_path) > os.path.getmtime(mp) + 1e-6:
                return None
    except (TypeError, ValueError, OSError):
        return None
    ok = meta.get("ok")
    if not isinstance(ok, bool):
        # ok 不是真布尔（sidecar 被外部改坏了，例如 "ok": "false"）→ 结论不可信。
        # 这里必须返回 None 让调用方重跑 ffprobe，而不是当成 False —— 当成 False
        # 会把一个完好的视频误隔离进 rejected/，当成 True 又会放过残片。
        return None

    # 免费的自洽性交叉检查：sidecar 既然自称 ok=True，它自己记的 ratio 就该落在
    # 合格区间内。字段互相矛盾（ok=true 但 ratio=0.06）说明这份 sidecar 不是本模块
    # 正常写出来的 —— 重跑一次 ffprobe，别拿它判案。
    # 注意：这不是防伪，只是不带额外成本的「看它自圆其说吗」。
    if ok:
        try:
            ratio_v = meta.get("ratio")
            if ratio_v is not None:
                r = float(ratio_v)
                if not (MIN_RATIO <= r <= MAX_RATIO):
                    return None
        except (TypeError, ValueError):
            return None

    reason = str(meta.get("reason") or ("ok" if ok else "unknown"))
    return ok, reason, meta


def _record_result(video_path: str, ok: bool, reason: str,
                   real: int, expected: int, ratio: float, size: int) -> None:
    """把本次判定写进 sidecar（写失败静默，不影响返回值）。"""
    _write_meta(video_path, {"ok": ok, "reason": reason, "real_ms": real,
                             "expected_ms": expected, "ratio": ratio, "size": size,
                             "checked_at": time.time()})


def quarantine(path: str, reason: str) -> str:
    """把不合格视频移入 rejected/ 子目录，返回新路径（移动失败则返回原路径）。"""
    try:
        rej_dir = os.path.join(os.path.dirname(path), "rejected")
        os.makedirs(rej_dir, exist_ok=True)
        dst = os.path.join(rej_dir, os.path.basename(path))
        if os.path.exists(dst):
            stem, ext = os.path.splitext(os.path.basename(path))
            dst = os.path.join(rej_dir, f"{stem}_{int(time.time())}{ext}")
        shutil.move(path, dst)
        # sidecar 跟着走，便于追溯
        mp = _meta_path(path)
        if os.path.isfile(mp):
            try:
                shutil.move(mp, _meta_path(dst))
            except Exception:
                pass
        print(f"[video_verify] 已隔离不合格视频 {os.path.basename(path)} → rejected/ 原因: {reason}",
              file=sys.stderr)
        return dst
    except Exception as exc:
        print(f"[video_verify] 隔离失败 {path}: {exc}", file=sys.stderr)
        return path


# ---------------------------------------------------------------- 判定入口


def _undecidable(reason: str, note: str, strict: bool,
                 info: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
    """「无法判定」的统一出口：strict=fail-closed 拒收，否则降级 skipped 放行。"""
    if strict:
        info["reason"] = reason
        info["note"] = note + "，无法校验"
        return False, reason, info
    info["reason"] = "skipped"
    info["note"] = note
    return True, "skipped", info


def verify_mp4(
    path: str,
    chart_id: str | int,
    diff: Optional[int] = None,
    force: bool = False,
    strict: bool = False,
) -> Tuple[bool, str, Dict[str, Any]]:
    """校验一个 MP4 是否为「完整成品」。

    返回 `(是否通过, 原因, 详情)`。
    原因取值：`ok` / `skipped`（无 ffprobe 或 catalog 无该时长）/ `too_short`
             / `too_long` / `unreadable` / `missing`
             / `no_reference` / `no_ffprobe`（仅 strict 时出现）。

    通过时也会把结论写进 sidecar，下次可秒回。

    `strict=True` 时采用 fail-closed：凡是「无法判定」的情形（catalog 查不到时长、
    没有 ffprobe）一律判为不通过，而不是放行。上传入库路径必须用 strict ——
    否则守门会因为一个环境问题静默失效，残缺视频照样能发进群。
    读取既有缓存时用 strict=False，避免环境异常导致整库缓存被误隔离。
    """
    info: Dict[str, Any] = {"path": path, "chart_id": str(chart_id), "diff": diff}

    if not path or not os.path.isfile(path):
        info["reason"] = "missing"
        return False, "missing", info

    size = os.path.getsize(path)
    info["size"] = size

    expected = catalog_duration_ms(chart_id, diff)
    info["expected_ms"] = expected

    # 命中 sidecar 且文件尺寸未变 → 直接复用结论（省掉每次请求跑 ffprobe 的开销）
    if not force and expected:
        hit = _reuse_meta(_read_meta(path), expected, size, video_path=path)
        if hit:
            ok, reason, meta = hit
            info.update({"real_ms": meta.get("real_ms"), "ratio": meta.get("ratio"),
                         "cached": True})
            return ok, reason, info

    if expected is None:
        # 没有权威时长可用。strict（上传入库）时 fail-closed：判不出来就拒收，
        # 避免守门被环境问题绕过。
        return _undecidable(
            "no_reference", "catalog 中查不到该曲目时长", strict, info)

    real = probe_duration_ms(path)
    info["real_ms"] = real

    if not real or real <= 0:
        if find_ffprobe() is None:
            # 探测不到 ffprobe：同样是「无法判定」，由 strict 决定拒收还是降级
            return _undecidable(
                "no_ffprobe", "未探测到 ffprobe", strict, info)
        info["reason"] = "unreadable"
        return False, "unreadable", info

    ratio = real / float(expected)
    info["ratio"] = round(ratio, 4)

    if ratio < MIN_RATIO:
        info["reason"] = "too_short"
        info["message"] = (f"视频时长 {real}ms 远短于该谱面应有的 {expected}ms"
                           f"（比值 {ratio:.3f} < {MIN_RATIO}）")
        _record_result(path, False, "too_short", real, expected, ratio, size)
        return False, "too_short", info

    if ratio > MAX_RATIO:
        info["reason"] = "too_long"
        info["message"] = (f"视频时长 {real}ms 明显超过该谱面的 {expected}ms"
                           f"（比值 {ratio:.3f} > {MAX_RATIO}）")
        _record_result(path, False, "too_long", real, expected, ratio, size)
        return False, "too_long", info

    _record_result(path, True, "ok", real, expected, ratio, size)
    return True, "ok", info
