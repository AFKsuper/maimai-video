# -*- coding: utf-8 -*-
"""曲目解析：ID 或别名 -> ADX 谱面 short_id（「谱面确认」等命令用）。

数据源（config.py 可改）：
- CATALOG_JSON：ADX 谱面目录（entries[].short_id/title/difficulties 槽位）
- ALIAS_JSON：maimaiDX 别名库 list[{song_id, name, alias:[...]}]（用户指定）

桥接：别名 -> 候选曲（name/alias 匹配）-> 曲名与目录 title 规范化匹配 -> short_id。
难度槽位编号 = maidata 的 &lv_N：2=Basic 3=Advanced 4=Expert 5=Master 6=Re:Master 7=Utage。

对外使用方：mai_preview.py（ar.resolve_chart / ar.ensure_difficulty / ar.highest_slot /
ar.describe_difficulty / ar.difficulty_options / ar.SLOT_COLOR）。
"""
from __future__ import annotations

import json
import os
import re
import unicodedata
from typing import List, Optional, Tuple

try:
    from . import config as cfg
    from .render_core import PreviewError
except ImportError:
    import config as cfg
    from render_core import PreviewError

# 槽位 -> 颜色（文案用）
SLOT_COLOR = {2: "绿", 3: "黄", 4: "红", 5: "紫", 6: "白", 7: "宴"}

_cat_cache = None          # {'entries': [...], 'by_id': {...}, 'norm_titles': [...]}
_cat_stat = None           # (mtime, size)：服务端懒加载补目录后自动重载，bot 免重启
_alias_cache = None        # [(item, [norm_name, ...]), ...]


# ---------------------------------------------------------------- 数据加载


def _norm(s: str) -> str:
    """规范化：NFKC + casefold + 去掉全部标点/空格（保留 CJK 与字母数字）。"""
    s = unicodedata.normalize("NFKC", str(s)).casefold()
    return re.sub(r"[\W_]+", "", s, flags=re.UNICODE)


def _load_catalog() -> dict:
    """载入谱面目录；按 (mtime, size) 失效缓存，服务端补数据后 bot 免重启。"""
    global _cat_cache, _cat_stat
    path = cfg.CATALOG_JSON
    try:
        st = os.stat(path)
        stat = (st.st_mtime, st.st_size)
    except OSError:
        stat = None
    if _cat_cache is None or stat != _cat_stat:
        if not os.path.isfile(path):
            raise PreviewError(f"谱面目录不存在：{path}\n请检查 config.py 的 CATALOG_JSON。")
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
        entries = data.get("entries") or []
        by_id, norm_titles = {}, []
        for e in entries:
            sid = str(e.get("short_id") or "")
            if sid:
                by_id[sid] = e
            norm_titles.append(_norm(e.get("title", "")))
        _cat_cache = {"entries": entries, "by_id": by_id, "norm_titles": norm_titles}
        _cat_stat = stat
    return _cat_cache


def _load_aliases() -> List[Tuple[dict, List[str]]]:
    """载入别名库（进程内一次）；缺文件抛可读的 PreviewError。"""
    global _alias_cache
    if _alias_cache is None:
        path = cfg.ALIAS_JSON
        if not os.path.isfile(path):
            raise PreviewError(
                f"别名库不存在：{path}\n请检查 config.py 的 ALIAS_JSON（maimaiDX 是否安装）。"
            )
        with open(path, encoding="utf-8") as fh:
            items = json.load(fh)
        _alias_cache = []
        for it in items:
            names = [_norm(x) for x in [it.get("name", "")] + list(it.get("alias") or []) if x]
            names = [n for n in names if n]
            if names:
                _alias_cache.append((it, names))
    return _alias_cache


def get_entry(short_id: str) -> Optional[dict]:
    """按 short_id 取目录条目，没有则 None。"""
    return _load_catalog()["by_id"].get(str(short_id))


# ---------------------------------------------------------------- 曲目解析


def _alias_pool(nt: str, token: str) -> List[Tuple[dict, List[str]]]:
    """别名池：先全等命中，退化为子串互含（截前 50 条防超短关键字爆量）。"""
    aliases = _load_aliases()

    # 1) 全等匹配 name / 任一别名
    pool = [(it, names) for it, names in aliases
            if any(n == nt for n in names)]
    # 2) 退化为子串互含
    if not pool:
        pool = [(it, names) for it, names in aliases
                if any(nt in n or n in nt for n in names)]
        pool = pool[:50]  # 防超短关键字爆量
    if not pool:
        raise PreviewError(
            f"别名库中找不到「{token}」。请改用曲 ID（纯数字），或检查拼写/别名。"
        )
    return pool


def _catalog_hits(pool: List[Tuple[dict, List[str]]], cat: dict) -> dict:
    """候选曲的原名 -> 目录中匹配的条目（short_id -> entry，保序去重）。"""
    hits: dict = {}           # short_id -> entry
    seen_names: set = set()
    for it, _ in pool:
        song = _norm(it.get("name", ""))
        if not song or song in seen_names:
            continue
        seen_names.add(song)
        # 规范化全等，其次前缀互含，处理 "XXX (2)"/"(DX)" 后缀
        for e, t in zip(cat["entries"], cat["norm_titles"]):
            if not t:
                continue
            if t == song or (len(song) >= 2 and (t.startswith(song) or song.startswith(t))):
                sid = str(e.get("short_id") or "")
                if sid:
                    hits.setdefault(sid, e)
    return hits


def resolve_chart(token: str) -> Tuple[str, Optional[dict]]:
    """纯数字 -> 直接当 short_id；否则走别名库。返回 (short_id, entry|None)。

    找不到 -> PreviewError；多首候选 -> PreviewError 带候选列表。
    """
    token = token.strip()
    if not token:
        raise PreviewError("谱面 ID/别名为空。")
    if re.fullmatch(r"[0-9]+", token):
        return token, get_entry(token)

    nt = _norm(token)
    if not nt:
        raise PreviewError(f"无法识别的曲名「{token}」。")

    pool = _alias_pool(nt, token)
    hits = _catalog_hits(pool, _load_catalog())

    if len(hits) == 1:
        sid, e = next(iter(hits.items()))
        return sid, e
    if not hits:
        name = pool[0][0].get("name", token)
        raise PreviewError(f"别名库有曲《{name}》，但 ADX 资源库无对应谱面。")
    lines = [f"「{token}」匹配到多首曲，请用 ID 指定："]
    for sid, e in list(hits.items())[:8]:
        lines.append(f"  {sid}  《{e.get('title', '?')}》")
    raise PreviewError("\n".join(lines))


# ---------------------------------------------------------------- 难度辅助


def difficulty_options(entry: Optional[dict]) -> List[Tuple[int, str, str]]:
    """[(槽位, 难度名, 等级)] 按槽位升序。"""
    if not entry:
        return []
    ds = sorted(entry.get("difficulties") or [], key=lambda d: d.get("slot", 0))
    return [(d.get("slot", 0), d.get("name", ""), str(d.get("level", ""))) for d in ds]


def _level_value(level) -> Optional[float]:
    """把定数文本转成可比较的数值（仅用于展示/排序参考，不参与选档）。

    maidata 里的定数有三种写法：`14.9`、`12+`、`12?`（宴谱常见，表示未知）。
    `12+` 表示「12 往上一点」，记作 12.5。
    """
    s = str(level or "").strip()
    if not s:
        return None
    m = re.match(r"^(\d+(?:\.\d+)?)\s*([+\-?]?)", s)
    if not m:
        return None
    try:
        base = float(m.group(1))
    except ValueError:
        return None
    if m.group(2) == "+":
        base += 0.5
    return base


def highest_slot(entry: Optional[dict]) -> Optional[int]:
    """最高难度档位的槽位；无条目/无难度返回 None。

    **按槽位号取最大，不按定数比较。** 理由是玩家的直觉：
    「最高等级」说的是最高那一档难度（有白谱就发白谱、有宴谱就发宴谱），
    而不是「定数最大的那一档」。

    官方的定数并不总是随难度递增 —— 全库有 9 首白谱的定数略低于紫谱
    （例：11232 紫 13.8 / 白 13.7）。如果按定数取最大，这些曲子在用户
    不写难度时会发出紫谱，而用户期待的显然是白谱。
    """
    opts = difficulty_options(entry)
    return opts[-1][0] if opts else None


def describe_difficulty(entry: Optional[dict], slot: int) -> str:
    """槽位 -> 「紫 MASTER Lv.14.9」。"""
    for s, name, level in difficulty_options(entry):
        if s == slot:
            color = SLOT_COLOR.get(s, "")
            return f"{color} {name} Lv.{level}".strip()
    return f"难度 {slot}"


def ensure_difficulty(entry: Optional[dict], diff: Optional[int]) -> None:
    """用目录提前校验所选槽位。

    entry 缺失（曲 id 不在 ADX 资源库）时没法按目录校验，但仍要拦住
    明显不存在的槽位：simai 的难度槽位固定是 2-7，别的数字透传到手机
    只会让渲染页报错，不如在这里就说清楚。
    """
    if diff is None:
        return
    if entry is None:
        if diff not in SLOT_COLOR:
            raise PreviewError(
                f"没有难度 {diff}。可用：1=绿 2=黄 3=红 4=紫 5=白，宴写「宴」。"
            )
        return
    opts = difficulty_options(entry)
    if not opts:
        return
    if diff not in [s for s, _, _ in opts]:
        avail = " ".join(
            f"{i}={SLOT_COLOR.get(s, '')}" if i <= 5 else "宴"
            for i, (s, _n, _l) in enumerate(opts, 1)
        )
        title = entry.get("title", "?")
        raise PreviewError(
            f"《{title}》没有这一档难度。可用：{avail}"
        )
