# -*- coding: utf-8 -*-
"""mai_preview 手机分发节点通信桥（Phone Bridge，服务端）。

一句话职责：服务器自己不渲染，只负责「向手机要视频」和「把视频收下来」。

本桥是一个跑在 HoshinoBot 进程内的 aiohttp 服务，默认监听 0.0.0.0:8778，
对接着三类对端：

1. **手机 Termux Agent**（phone_client/phone_agent.py）
   反向 WebSocket 连到 `GET /ws?token=...`，发心跳、报「有没有这个曲子」，
   并用 `POST /upload` 把手机上已预录的 MP4 回传上来。

2. **手机 Chrome 常驻工作页**（server/worker.html）
   每几秒轮询 `GET /api/task?token=...` 领渲染任务，编码完把 MP4 传给
   `POST /upload`；中间用 `GET|POST /api/report?token=...` 报进度与保活。
   为什么不反过来由服务器命令手机开网页：Android 10+ / MIUI 会拦截后台
   Termux 调 `am start`（实测 `java.lang.reflect.InvocationTargetException`），
   所以改成「手机页面主动来取活」这条不依赖后台启动权限的通道。

3. **机器人命令层**（mai_preview.py）
   调用 `request_video_from_phone()` / `request_render_on_phone()` 拿成品路径。

两个端口的分工（很容易搞混，务必分清）：
  - 8778：本桥，跑在**服务器**上。手机通过它取任务（`/api/task`）、报进度
    （`/api/report`）、上报「已存好」（`/api/stored`），需要时再把成品传上来
    （`/upload`）发群。云服务器上必须让这个端口对外可达。
  - 8777 + 8780：跑在**手机**上（Termux 里的 render_server.py，见
    phone_client/render_server.py）。8777 提供渲染器静态文件与谱面数据，
    8780 收渲染产物直接落进 /sdcard/Download/maimai/。手机用
    http://127.0.0.1:8777 访问 —— 只有 localhost 才是安全上下文，
    非 localhost 下浏览器不给 WebCodecs 的 VideoEncoder，编码页必然失败。
    这两个端口只在手机内部，不需要对任何外部地址开放，也不需要 adb reverse。

进程内单例：重复调用 `start_server()` 是安全的（端口已占用时视为复用）。
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import shutil
import socket
import subprocess
import time
import uuid
from typing import Any, Dict, List, Optional, Set, Tuple
from urllib.parse import quote, urlencode, urlparse

from aiohttp import WSMsgType, web

try:
    from . import config as cfg
except ImportError:  # 兼容极端加载方式
    import config as cfg

try:
    from . import video_verify
except ImportError:  # 兼容极端加载方式
    import video_verify

# 手机端只编画面（WebCodecs 那条链路没有 AudioEncoder），成片回传后在这里用
# 服务器上的 ffmpeg 把音轨接上。拿不到这个模块也只是「没声音」，不影响入库。
try:
    from . import audio_mux
except ImportError:  # 兼容极端加载方式
    try:
        import audio_mux
    except ImportError:
        audio_mux = None

# 仅调试接口用它查「该曲最高难度」，好让 /debug/render 给出的链接和主命令一致。
# 拿不到就退回默认槽位，不影响任何生产路径。
try:
    from . import alias_resolve as _alias_resolve
except ImportError:  # 兼容极端加载方式
    try:
        import alias_resolve as _alias_resolve
    except ImportError:
        _alias_resolve = None

logger = logging.getLogger("hoshino.mai_preview.phone_bridge")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)


# ======================================================================
# 模块级状态
# ======================================================================

# 当前连着的手机 Termux Agent WebSocket（可能不止一台手机）
_connected_clients: Set[web.WebSocketResponse] = set()

# req_id -> asyncio.Future[dict]：正在等回音的请求
_pending_requests: Dict[str, asyncio.Future] = {}

# req_id -> (chart_id, diff)：视频落盘时据此唤醒所有在等同一谱面的请求。
# 与 _pending_requests 分开存是因为一个 req_id 只能有一个 Future，但一次落盘
# 可能要让「好几个在等同一首曲子不同 req_id 的群」一起醒来。
_pending_key: Dict[str, Tuple[str, int]] = {}

# 待渲染任务队列。每条任务是：
#   {request_id, chart_id, diff, created_at, dispatched_at, attempts[, extra_request_ids]}
# 由手机工作页主动来 pop，服务器不主动推。
#
# **取走不等于完成**：pop 只是「租出去」——给任务打一个租约（leased_until），
# 租约到期还没收到 /api/stored 或 /api/report done，就把任务放回去让别人重做。
# 为什么必须这样：工作页可能被系统回收、被刷新、编码崩溃，任务已经离开队列却
# 永远出不了片。早先的实现 pop 完就删，实测一次刷新就吞掉几百条任务，
# 批量会卡在「队列空了但还有一半没出片」的状态里干等到超时。
_render_tasks: List[Dict[str, Any]] = []
_render_task_lock = asyncio.Lock()

# 单条任务的租约时长（秒）。手机编一支最长约 3 分钟（含下载音轨），给足余量。
_RENDER_LEASE_S: float = 300.0

# 批量预渲染任务的 request_id 前缀。pop_render_task 靠它区分
# 「用户点播」和「后台铺量」——用户点播优先出队。
_BATCH_REQ_PREFIX = "batch_"

# 手机工作页存活探测：worker.html 每次轮询 /api/task（哪怕队列是空的）以及
# /api/report 都会刷新这个时间戳。超过 _WORKER_STALE_S 秒没动静就认为
# 工作页已被关掉或被系统回收。
_WORKER_LAST_SEEN: float = 0.0
_WORKER_LAST_UA: str = ""
_WORKER_STALE_S: float = 25.0

# 成品「存回手机」的等待表：storage_id -> Future。
# 手机 Agent 下载完服务器上的成品后，通过 WS 回一条 video_stored 唤醒这里。
_store_requests: Dict[str, asyncio.Future] = {}


def _touch_worker(request: web.Request) -> None:
    global _WORKER_LAST_SEEN, _WORKER_LAST_UA
    _WORKER_LAST_SEEN = time.time()
    _WORKER_LAST_UA = request.headers.get("User-Agent", "")[:120]


def is_worker_alive() -> bool:
    """手机常驻工作页是否还在轮询（最近 _WORKER_STALE_S 秒内有过请求）。"""
    return (time.time() - _WORKER_LAST_SEEN) < _WORKER_STALE_S if _WORKER_LAST_SEEN else False


def get_worker_info() -> Dict[str, Any]:
    if not _WORKER_LAST_SEEN:
        return {"alive": False, "last_seen_s": None, "ua": ""}
    return {
        "alive": is_worker_alive(),
        "last_seen_s": round(time.time() - _WORKER_LAST_SEEN, 1),
        "ua": _WORKER_LAST_UA,
    }


def _find_render_task(req_id: str) -> Optional[Dict[str, Any]]:
    """按 request_id 在队列里找任务（找不到返回 None）。"""
    for t in _render_tasks:
        if t.get("request_id") == req_id:
            return t
    return None


async def enqueue_render_task(chart_id: str | int, diff: int, request_id: str) -> Dict[str, Any]:
    """把一条渲染任务放入队列，等手机工作页来取。

    同一 (chart_id, diff) 已在队列里时不重复入队 —— 多个群同时喊同一首曲子很常见，
    让它们共享同一条任务、等同一个成品文件，比重复渲染多份 60fps 视频经济得多
    （手机全曲编码要 1-2 分钟）。新来的 req_id 记进 extra_request_ids 备查。

    **例外：用户点播不跟批量任务合并。** 铺量期间队列里几乎每个 (chart_id, diff)
    都有一条 `batch_` 任务，如果点播来了就并进去，这条点播会顶着批量的身份
    排在两千条队尾等着 —— 优先级机制等于没用。所以这里只在
    「同类任务」之间去重：点播找点播、批量找批量。
    多渲染一支的代价，换用户不用等几十小时，划算。

    返回队列里实际生效的那条任务。
    """
    cid, df = str(chart_id), int(diff)
    incoming_batch = str(request_id).startswith(_BATCH_REQ_PREFIX)
    async with _render_task_lock:
        # 已经租出去（正在手机/电脑上编）的同款任务也不要重复入队，
        # 否则批量重启一次就会把手上正在跑的那几条又排一遍。
        for t in _render_leased.values():
            if str(t.get("chart_id")) != cid or int(t.get("diff", -1)) != df:
                continue
            same_kind = str(t.get("request_id", "")).startswith(_BATCH_REQ_PREFIX) == incoming_batch
            if not same_kind:
                continue
            logger.info(f"[PhoneBridge] 该谱面正在渲染中，复用已派发的任务: "
                        f"chart={cid} diff={df} req_id={t['request_id']}")
            t.setdefault("extra_request_ids", []).append(request_id)
            return t
        for t in _render_tasks:
            if t["chart_id"] != cid or int(t["diff"]) != df:
                continue
            same_kind = str(t.get("request_id", "")).startswith(_BATCH_REQ_PREFIX) == incoming_batch
            if not same_kind:
                continue
            logger.info(f"[PhoneBridge] 该谱面已在渲染队列中，复用已有任务: "
                        f"chart={cid} diff={df} 原req_id={t['request_id']} 新req_id={request_id}")
            t.setdefault("extra_request_ids", []).append(request_id)
            return t
        task = {
            "request_id": request_id,
            "chart_id": cid,
            "diff": df,
            "created_at": time.time(),
            "dispatched_at": 0.0,
            "attempts": 0,
        }
        _render_tasks.append(task)
    logger.info(f"[PhoneBridge] 渲染任务已入队: chart={cid} diff={df} req_id={request_id} "
                f"(队列长度 {len(_render_tasks)})")
    return task


async def pop_render_task() -> Optional[Dict[str, Any]]:
    """手机工作页来取一条待渲染任务（取走即打租约，不是删除）。

    为什么改成租约而不是「取走即出队」：早先取走就删，工作页一旦被系统回收、
    被手动刷新、或者编码 Worker 崩掉，任务就永久丢失 —— 队列显示空了，
    但批量清单里还有一半没出片，只能干等到超时判失败。实测刷新一次工作页
    就吞掉几百条。现在取走只是登记进 `_render_leased`，租约到期没等到
    /api/stored 或 /api/report done 就自动放回队列重做。

    **优先级**：用户点播（`request_id` 不以 `batch_` 开头）永远排在批量预渲染前面。
    批量动辄两千条，一旦全塞进 FIFO，群里点一首新曲子要在队尾等几十小时 ——
    用户等不起，而预渲染本来就是「有空再铺」的后台活。所以这里按优先级取：
    先找第一条非批量的，没有才退回去取批量的。
    """
    _reclaim_expired_leases()
    async with _render_task_lock:
        if not _render_tasks:
            return None
        picked = 0
        for i, t in enumerate(_render_tasks):
            if not str(t.get("request_id", "")).startswith(_BATCH_REQ_PREFIX):
                picked = i
                break
        task = _render_tasks.pop(picked)
        task["dispatched_at"] = time.time()
        task["attempts"] = int(task.get("attempts", 0)) + 1
        task["leased_until"] = time.time() + _RENDER_LEASE_S
        _render_leased[str(task["request_id"])] = task
    logger.info(f"[PhoneBridge] 渲染任务已被领取（租约 {int(_RENDER_LEASE_S)}s）: "
                f"req_id={task['request_id']} 第 {task['attempts']} 次")
    return task


# 已租出去、还没确认完成的任务：req_id -> task。租约到期会被回收回队列。
_render_leased: Dict[str, Dict[str, Any]] = {}


def _reclaim_expired_leases() -> int:
    """把租约过期（拿走却没回音）的任务放回队列，返回回收条数。

    典型场景：工作页被系统回收、被手动刷新、编码 Worker 崩溃。任务在
    `_render_leased` 里挂着而手机上什么都没产出，不回收就永远丢了。
    """
    now = time.time()
    back = 0
    for req_id, task in list(_render_leased.items()):
        if float(task.get("leased_until", 0)) > now:
            continue
        _render_leased.pop(req_id, None)
        task["dispatched_at"] = 0.0
        task["leased_until"] = 0.0
        if _render_tasks.count(task) == 0:
            _render_tasks.append(task)
        back += 1
        logger.warning(f"[PhoneBridge] 任务租约过期，放回队列重试: req_id={req_id} "
                       f"chart={task.get('chart_id')} diff={task.get('diff')} "
                       f"第 {task.get('attempts', 0)} 次")
    return back


def _finish_render_task(req_id: str) -> None:
    """确认一条任务真的完成了：从租约表里摘掉，不再回收。"""
    _render_leased.pop(str(req_id or ""), None)


def _finish_render_task_by_ids(chart_id: str | int, diff: int) -> int:
    """没带 request_id 时的兜底：按 (曲id, 槽位) 把所有租约中同款任务标记完成。

    工作页的 /api/stored 会带 request_id，但手工 curl、旧版页面、以及
    批量清单里复用同一条任务的多个 req_id 都可能不带，所以留这条兜底。
    """
    cid, df = str(chart_id), int(diff)
    done = 0
    for rid, t in list(_render_leased.items()):
        if str(t.get("chart_id")) == cid and int(t.get("diff", -1)) == df:
            _render_leased.pop(rid, None)
            done += 1
    return done


def get_render_queue_info() -> Dict[str, Any]:
    """给 /status 用的队列概览（最多列前 20 条）。"""
    return {
        "pending": len(_render_tasks),
        "leased": len(_render_leased),
        "tasks": [
            {"request_id": t["request_id"], "chart_id": t["chart_id"], "diff": t["diff"],
             "waited_s": round(time.time() - t["created_at"], 1)}
            for t in _render_tasks[:20]
        ],
    }


def _wake_pending_for(chart_id: str | int, diff: int, result: Dict[str, Any]) -> int:
    """唤醒所有在等同一 (chart_id, diff) 成品的等待者，返回唤醒个数。

    多个群可能同时喊同一首曲子：它们共享队列里的一条任务（见 enqueue_render_task），
    成品上传后必须全部唤醒，否则后到的群会白等到超时。
    """
    cid, df = str(chart_id), int(diff)
    woken = 0
    for rid, key in list(_pending_key.items()):
        if key != (cid, df):
            continue
        fut = _pending_requests.get(rid)
        if fut and not fut.done():
            fut.set_result(dict(result))
            woken += 1
    if woken > 1:
        logger.info(f"[PhoneBridge] 已唤醒 {woken} 个等待同一谱面的请求 (chart={cid} diff={df})")
    return woken


# 服务生命周期（单例）
_server_runner: Optional[web.AppRunner] = None
_server_site: Optional[web.TCPSite] = None
_server_lock = asyncio.Lock()
_is_running: bool = False

# chart_id 只允许纯数字短 ID；diff 只允许 1-2 位数字。
# 这两个正则的唯一用途是把网络来的参数安全地拼进文件名 ——
# 否则 "..\..\x" 或绝对路径能把临时文件写到缓存目录之外。
_CHART_ID_RE = re.compile(r"^[0-9]{1,12}$")
_DIFF_RE = re.compile(r"^[0-9]{1,2}$")

# simai 的 &lv_N 槽位只有 2-7（2=绿 3=黄 4=红 5=紫 6=白 7=宴）。
# catalog.json 全量 1932 条里出现过的 slot 也只有 2-7，所以这里按真实取值收紧：
# 只放行 2-7，其余（0/1/8/9/99…）一律当非法难度拒收。
#
# 为什么必须挡：catalog_duration_ms() 在槽位查不到时会「退回条目级时长」，
# 于是 diff=0 也能拿到一个像样的期望时长、顺利通过完整性校验，
# 最后在缓存里留下一个永远不该存在的 {chart_id}_0.mp4。
_VALID_DIFF_SLOTS = frozenset({2, 3, 4, 5, 6, 7})


def _sanitize_upload_ids(chart_id: Any, diff: Any) -> Optional[Tuple[str, int]]:
    """校验并归一化上传带来的 chart_id / diff。

    合法就返回 (chart_id, diff)，不合法返回 None（调用方一律回 422）。
    这里刻意 fail-closed：宁可拒收，也不接受一个拼不出安全文件名、
    或者难度槽位根本不存在的组合。
    """
    # 不能写 `chart_id or ""`：diff=0 会被 or 短路成空串，
    # 于是「难度非法」被误报成「没带难度」，排查时看不出真正原因。
    cid = "" if chart_id is None else str(chart_id).strip()
    dif = "" if diff is None else str(diff).strip()
    if not _CHART_ID_RE.match(cid) or not _DIFF_RE.match(dif):
        return None
    slot = int(dif)
    if slot not in _VALID_DIFF_SLOTS:
        return None
    return cid, slot


def _safe_target_path(cache_dir: str, out_name: str) -> Optional[str]:
    """把落盘路径钉死在 cache_dir 内部，越界返回 None。

    basename() 先削掉任何目录成分，再用 realpath 复核结果确实还在缓存目录里 ——
    双保险，任一环节被绕过都拦得住。
    """
    base = os.path.realpath(cache_dir)
    target = os.path.realpath(os.path.join(base, os.path.basename(out_name)))
    if target != base and not target.startswith(base + os.sep):
        return None
    return target


def _ensure_cache_dir() -> str:
    """确保本地 MP4 缓存目录存在，返回其路径。"""
    cache_dir = getattr(cfg, "MP4_CACHE_DIR", os.path.join(cfg.HERE, "cache", "mp4"))
    os.makedirs(cache_dir, exist_ok=True)
    return cache_dir


def _accept_cached(path: str, chart_id: str | int, diff: Optional[int]) -> Optional[str]:
    """对候选缓存做时长完整性校验：过关返回路径，不过关隔离后返回 None。

    这是最关键的一道守门。手机上可能残留早期测试留下的短片段（例如只有 10 秒的
    11879_5.mp4，而全曲 162.5 秒）。早期版本只判断「存在且 > 1024 字节」，
    于是残片被当成品发进了群。现在统一交给 video_verify 按 catalog 里的权威时长
    判定，不合格的移进 cache/mp4/rejected/ 并留日志。
    """
    if not os.path.isfile(path) or os.path.getsize(path) <= 1024:
        return None
    try:
        ok, reason, info = video_verify.verify_mp4(path, chart_id, diff)
    except Exception as exc:
        # 校验模块自己出问题不该阻断业务，降级为「放行」并留一条 warning。
        logger.warning(f"[PhoneBridge] 缓存校验异常，按放行处理: {exc}")
        return path
    if ok:
        if reason == "skipped":
            logger.info(f"[PhoneBridge] 缓存 {os.path.basename(path)} 未做时长校验（{info.get('note')}）")
        return path
    logger.warning(
        f"[PhoneBridge] 缓存视频不合格，已隔离：{os.path.basename(path)} "
        f"reason={reason} real={info.get('real_ms')}ms expected={info.get('expected_ms')}ms "
        f"ratio={info.get('ratio')}"
    )
    video_verify.quarantine(path, reason)
    return None


def get_cached_mp4(chart_id: str | int, diff: Optional[int] = None) -> Optional[str]:
    """本地缓存里找该谱面的 MP4，找到返回路径，没有返回 None。

    匹配规则：
      指定 diff 时：先 {chart_id}_{diff}.mp4，再退化到不带难度的 {chart_id}.mp4；
      未指定 diff：先 {chart_id}.mp4，再扫 {chart_id}_*.mp4 从高槽位往下找。

    每个候选都先过 _accept_cached 的时长校验；不合格的会被隔离掉再继续找下一个，
    全都不合格就返回 None，调用方会转而走「让手机现场渲染」那条路。

    命中时顺手把文件 mtime 摸成当前时间 —— 这就是 LRU 的「用过」记号，
    见 evict_cache_lru()。不摸的话缓存淘汰会退化成按「入库先后」淘汰，
    反复要的老曲目反而可能被踢掉。
    """
    hit = _lookup_cached_mp4(chart_id, diff)
    if hit:
        try:
            os.utime(hit, None)
        except OSError:
            pass
    return hit


def _lookup_cached_mp4(chart_id: str | int, diff: Optional[int] = None) -> Optional[str]:
    """get_cached_mp4 的纯查找部分（不更新 LRU 记号）。"""
    cache_dir = _ensure_cache_dir()
    cid = str(chart_id).strip()

    if diff is not None:
        for name in (f"{cid}_{diff}.mp4", f"{cid}.mp4"):
            hit = _accept_cached(os.path.join(cache_dir, name), cid, diff)
            if hit:
                return hit
        return None

    # 未指定难度：先看无难度的通用名
    hit = _accept_cached(os.path.join(cache_dir, f"{cid}.mp4"), cid, None)
    if hit:
        return hit

    # 再扫 {cid}_*.mp4，按「数值槽位」从大到小试（槽位数字越大难度越高）。
    #
    # 这里必须按整数排序，不能按文件名字符串排序：字符串序里 "12059_99.mp4" 会排在
    # "12059_5.mp4" 之后，reversed() 一取就把非法槽位的文件当成「最高难度」返回。
    # 解析不出槽位的名字（例如手工放进去的 11879_master.mp4）排在最后兜底。
    try:
        names = [f for f in os.listdir(cache_dir)
                 if f.startswith(f"{cid}_") and f.endswith(".mp4")]
    except OSError:
        names = []

    def _slot_of(name: str) -> int:
        stem = os.path.splitext(name)[0]
        tail = stem.rsplit("_", 1)[-1] if "_" in stem else ""
        if tail.isdigit() and int(tail) in _VALID_DIFF_SLOTS:
            return int(tail)
        return -1  # 非法/无法识别的槽位，一律降到最低优先级

    for name in sorted(names, key=lambda n: (_slot_of(n), n), reverse=True):
        slot = _slot_of(name)
        hit = _accept_cached(os.path.join(cache_dir, name), cid,
                             slot if slot > 0 else None)
        if hit:
            return hit
    return None


def is_phone_online() -> bool:
    """当前是否有手机 Termux Agent 连着（顺手清掉已关闭的连接）。"""
    alive = [ws for ws in _connected_clients if not ws.closed]
    _connected_clients.clear()
    _connected_clients.update(alive)
    return len(_connected_clients) > 0


def get_online_phone_count() -> int:
    """当前在线的手机 Agent 连接数。"""
    return len([ws for ws in _connected_clients if not ws.closed])


def evict_cache_lru(keep: Optional[str] = None) -> int:
    """缓存超过上限时，按「最久没被用过」淘汰，返回删掉的文件数。

    视频的权威副本在手机（/sdcard/Download/maimai/），服务器这份只是发群时的
    中转。所以这里可以放心删 —— 删掉之后下次要这支，会让手机 Agent 再传一遍，
    代价是一趟 WiFi 传输，不会丢数据。

    「最久没用过」用文件 mtime 判定，get_cached_mp4 命中时会 os.utime 刷新它。
    被删的连同 .meta.json 一起删，避免留下无人认领的校验记录。

    keep 传当前正在投递的那支路径，它会被跳过：机器人可能正拿着 file:/// 路径
    往 QQ 协议端投递，这时候删就是和投递抢时间。这里宁可这一轮超出上限。
    """
    max_mb = float(getattr(cfg, "MP4_CACHE_MAX_MB", 0) or 0)
    if max_mb <= 0:
        return 0

    cache_dir = _ensure_cache_dir()
    try:
        names = [f for f in os.listdir(cache_dir) if f.endswith(".mp4")]
    except OSError:
        return 0

    keep_abs = os.path.abspath(keep) if keep else ""
    entries = []
    total = 0
    for name in names:
        fp = os.path.join(cache_dir, name)
        try:
            st = os.stat(fp)
        except OSError:
            continue
        total += st.st_size
        entries.append((st.st_mtime, st.st_size, fp))

    limit = int(max_mb * 1024 * 1024)
    if total <= limit:
        return 0

    entries.sort(key=lambda x: x[0])          # 最久没碰过的排前面
    removed = 0
    for _mtime, size, fp in entries:
        if total <= limit:
            break
        if keep_abs and os.path.abspath(fp) == keep_abs:
            continue
        try:
            os.remove(fp)
        except OSError:
            continue
        try:
            os.remove(fp + ".meta.json")
        except OSError:
            pass
        total -= size
        removed += 1
        logger.info(f"[PhoneBridge] 缓存超限，淘汰最久未用: {os.path.basename(fp)} "
                    f"({size / 1048576:.1f} MB)")
    if removed:
        logger.info(f"[PhoneBridge] 本轮淘汰 {removed} 份，缓存降到 {total / 1048576:.1f} MB")
    return removed


def _check_token(request: web.Request) -> bool:
    """校验请求携带的 token，三种位置任选其一即可。

    依次尝试 query `token`、Header `X-Token`、`Authorization: Bearer <token>`。
    配置里 token 为空视为不启用鉴权（本机联调时用）。
    """
    expected = getattr(cfg, "PHONE_BRIDGE_TOKEN", "YOUR_SECRET_TOKEN")
    if not expected:
        return True
    valid_tokens = {expected}

    token = request.query.get("token")
    if token and token in valid_tokens:
        return True

    x_token = request.headers.get("X-Token")
    if x_token and x_token in valid_tokens:
        return True

    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer ") and auth[7:].strip() in valid_tokens:
        return True

    return False


# ======================================================================
# HTTP / WebSocket 处理函数
# ======================================================================

async def handle_healthz(request: web.Request) -> web.Response:
    """健康检查（不需要 token）：给探活脚本和 serve.py 的 ensure_server 用。"""
    online_count = get_online_phone_count()
    return web.json_response({
        "status": "ok",
        "service": "mai_preview_phone_bridge",
        "online": online_count > 0,
        "online_count": online_count,
        "time": time.time(),
    })


async def handle_status(request: web.Request) -> web.Response:
    """详细状态（要 token）：看手机节点、工作页、渲染队列和本地缓存。"""
    if not _check_token(request):
        return web.json_response({"status": "error", "message": "unauthorized"}, status=403)

    cache_dir = _ensure_cache_dir()
    cached_files = []
    rejected_count = 0
    try:
        for f in os.listdir(cache_dir):
            if not f.endswith(".mp4"):
                continue
            fp = os.path.join(cache_dir, f)
            item = {"name": f, "size": os.path.getsize(fp)}
            item["size_bytes"] = item["size"]
            # 带上 sidecar 里的校验结论：否则一个 ok=false 的残片也会被
            # /status 报成「缓存」，运维据此判断健康度就会被误导。
            #
            # 判定口径：sidecar 里明确写了「不合格」才算不可用。这里不只看布尔
            # False，也认字符串 "false"/"0"（历史 sidecar 或人工编辑可能写成字符串），
            # 因为这是纯展示字段 —— 判成不可用最多是显示保守，不会去动文件。
            # 真正的守门在 _reuse_meta：它要求 ok 必须是布尔，否则宁可重跑 ffprobe，
            # 所以显示端的宽松与守门端的严格互不影响。
            meta = video_verify._read_meta(fp)
            meta_ok = meta.get("ok") if isinstance(meta, dict) else None
            if isinstance(meta_ok, str):
                meta_ok = None if meta_ok.strip().lower() not in ("false", "0", "no") else False
            item["ok"] = meta_ok is not False
            if isinstance(meta, dict) and meta.get("reason"):
                item["reason"] = str(meta["reason"])
            if not item["ok"]:
                rejected_count += 1
            cached_files.append(item)
    except OSError:
        pass

    return web.json_response({
        "status": "ok",
        "online_phones": get_online_phone_count(),
        "worker": get_worker_info(),
        "render_queue": get_render_queue_info(),
        "batch": get_batch_info(),
        "stored_count": len(load_archived_index()),
        "store": {
            "enabled": bool(getattr(cfg, "PHONE_STORE_ENABLED", True)),
            "dir": getattr(cfg, "PHONE_STORE_DIR", "/sdcard/Download/maimai"),
            "save_url": getattr(cfg, "PHONE_SAVE_URL", ""),
            "cache_max_mb": float(getattr(cfg, "MP4_CACHE_MAX_MB", 0) or 0),
            "cache_used_mb": round(sum(e.get("size_bytes", 0) for e in cached_files) / 1048576.0, 2),
        },
        "cached_videos_count": len(cached_files),
        "cached_videos_invalid": rejected_count,
        "cached_videos": cached_files[:100],
    })


async def handle_video_download(request: web.Request) -> web.StreamResponse:
    """只读端点：让手机把服务器上的成品下载回去归档（GET /video/<文件名>）。

    为什么需要它：手机 Chrome 渲染出的 MP4 只 POST 到了服务器，手机本地不留
    副本；而手机 Agent 只会「读本地文件上传」。两边都只会往外掏，于是渲染越多
    手机越空，视频全堆在服务器上。有了这个端点，服务器就能反过来命令 Agent
    把成品拉回手机（见 request_phone_store）。

    安全约束与上传路径同一套：要 token、文件名必须是白名单里的 <id>_<槽位>.mp4、
    取 realpath 后必须落在缓存目录内（防路径穿越）。
    """
    if not _check_token(request):
        return web.json_response({"status": "error", "message": "unauthorized"}, status=403)

    name = request.match_info.get("name", "")
    if not name.endswith(".mp4"):
        return web.json_response({"status": "error", "message": "only .mp4"}, status=400)

    cache_dir = _ensure_cache_dir()
    target = _safe_target_path(cache_dir, name)
    if not target or not os.path.isfile(target):
        return web.json_response({"status": "error", "message": "not found"}, status=404)

    size = os.path.getsize(target)
    resp = web.StreamResponse(status=200, headers={
        "Content-Type": "video/mp4",
        "Content-Length": str(size),
        "Content-Disposition": f'attachment; filename="{name}"',
        "Cache-Control": "no-store",
    })
    await resp.prepare(request)

    # 边读边写：全曲成品有 30-70 MB，一次性读进内存会让机器人进程内存抖一下
    with open(target, "rb") as f:
        while True:
            chunk = f.read(256 * 1024)
            if not chunk:
                break
            await resp.write(chunk)
    await resp.write_eof()
    logger.info(f"[PhoneBridge] 手机拉取成品: {name} ({size} B)")
    return resp


async def handle_ws(request: web.Request) -> web.WebSocketResponse:
    """手机 Termux Agent 的反向 WebSocket 长连接入口。

    握手成功后先推一条 auth_ok，之后按事件类型分发：
      ping                 → 回 pong（应用层心跳，与 WS 原生 ping/pong 并存）
      video_not_found      → 手机上没有这条曲子的视频，唤醒等待者为 not_found
      video_uploaded       → 手机已通过 /upload 传完，去缓存里取路径并唤醒等待者
      launch_url_result    → 旧版「命令手机开浏览器」通道的回执，现在只记日志。
                             （Android 10+/MIUI 会拦截后台 am start，这条链路已废弃，
                             保留解析只是为了避免旧版 Agent 的回执刷警告日志。）
    """
    if not _check_token(request):
        logger.warning(f"Phone WS rejected: unauthorized request from {request.remote}")
        return web.Response(status=403, text="Forbidden: invalid token")

    ws = web.WebSocketResponse(heartbeat=15.0)
    await ws.prepare(request)

    _connected_clients.add(ws)
    client_addr = request.remote or "unknown"
    logger.info(f"[PhoneBridge] 手机 Termux 节点已连接: {client_addr}，当前在线节点数: {len(_connected_clients)}")

    try:
        await ws.send_json({
            "event": "auth_ok",
            "type": "auth_ok",
            "message": "Connected to mai_preview server bridge successfully.",
            "timestamp": time.time(),
        })

        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                try:
                    data = msg.json()
                except (ValueError, TypeError):
                    continue

                # Agent 侧字段名有过几轮演进，三种都认
                event = data.get("event") or data.get("type") or data.get("action")
                req_id = data.get("request_id") or data.get("task_id")

                if event == "ping":
                    await ws.send_json({"event": "pong", "type": "pong", "timestamp": time.time()})
                    continue

                if event in ("video_not_found", "not_found"):
                    fut = _pending_requests.get(req_id) if req_id else None
                    if fut and not fut.done():
                        fut.set_result({
                            "status": "not_found",
                            "message": data.get("message", "Video not found on phone node"),
                        })
                    continue

                if event in ("launch_url_result", "probe_launch_result"):
                    if data.get("ok"):
                        logger.info(f"[PhoneBridge] 手机已成功唤起浏览器 (req_id={req_id}, url={data.get('url')})")
                    else:
                        logger.warning(f"[PhoneBridge] 手机唤起浏览器失败 (req_id={req_id}): "
                                       f"code={data.get('returncode')} out={str(data.get('output'))[:300]}")
                    continue

                if event in ("video_uploaded", "video_ready"):
                    fut = _pending_requests.get(req_id) if req_id else None
                    if fut and not fut.done():
                        cached_path = get_cached_mp4(data.get("chart_id"), data.get("diff"))
                        fut.set_result({
                            "status": "success",
                            "file_path": cached_path,
                            "size": data.get("size", 0),
                        })
                    continue

                if event in ("video_stored", "video_archived"):
                    sid = data.get("storage_id") or req_id
                    fut = _store_requests.get(sid) if sid else None
                    if fut and not fut.done():
                        fut.set_result({
                            "ok": bool(data.get("ok", True)),
                            "path": data.get("path") or data.get("file_path"),
                            "size": data.get("size", 0),
                            "error": data.get("error"),
                        })
                    continue

                if event == "storage_failed":
                    sid = data.get("storage_id") or req_id
                    fut = _store_requests.get(sid) if sid else None
                    if fut and not fut.done():
                        fut.set_result({
                            "ok": False,
                            "error": data.get("error") or data.get("message") or "归档失败",
                        })
                    continue

            elif msg.type == WSMsgType.BINARY:
                # 兼容有人直接从 WS 管道推二进制视频帧（当前 Agent 走 HTTP /upload）
                logger.debug(f"Received binary frame from {client_addr}, size: {len(msg.data)}")

            elif msg.type in (WSMsgType.CLOSE, WSMsgType.CLOSING, WSMsgType.ERROR):
                break

    except Exception as e:
        logger.warning(f"Phone WS connection exception ({client_addr}): {e}")
    finally:
        _connected_clients.discard(ws)
        logger.info(f"[PhoneBridge] 手机 Termux 节点断开连接: {client_addr}，剩余在线节点: {len(_connected_clients)}")

    return ws


async def handle_upload(request: web.Request) -> web.Response:
    """接收手机端上传的 MP4 成品。

    两种投递方式都支持：
      1. multipart/form-data：file（或 video）字段带文件，另可带 request_id / chart_id / diff；
         缺 chart_id 时尝试从文件名 `<chart_id>_<diff>.mp4` 反推。
      2. 直接流式：Content-Type: video/mp4，参数走 URL Query 或 X-* 请求头。
         （手机 encoder-worker.js 走的就是这条。）

    所有参数先经 _sanitize_upload_ids 白名单过滤，再经 _safe_target_path 钉进缓存目录，
    绝不允许网络来的字符串直接决定落盘路径。

    落盘用「临时文件名 + os.replace」：手机可能中途断网，直接写目标文件会留下半截
    MP4 被后续当成成品。临时名带 pid 与随机后缀，多个上传并发也不会互相覆盖。
    """
    if not _check_token(request):
        logger.warning(f"Upload rejected: unauthorized request from {request.remote}")
        return web.json_response({"status": "error", "message": "unauthorized"}, status=403)

    cache_dir = _ensure_cache_dir()

    # 参数可以来自 Query，也可以来自请求头（老版 Agent 两种都用过）
    req_id = (request.query.get("request_id")
              or request.query.get("task_id")
              or request.headers.get("X-Request-ID")
              or request.headers.get("X-Task-ID")
              or "")
    chart_id = (request.query.get("chart_id")
                or request.headers.get("X-Chart-ID")
                or "")
    diff = (request.query.get("diff")
            or request.headers.get("X-Diff"))

    filename = ""
    target_path = ""
    file_bytes_written = 0
    diff_int: Optional[int] = None

    content_type = request.content_type or ""

    def _prepare_target(cid: Any, df: Any) -> Optional[str]:
        """按校验过的 id 决定落盘路径；id 不合法则用一个无归属的兜底名。

        兜底名的文件在后面过不了 id 校验那一关时会被删掉，不会留在缓存里。
        """
        nonlocal chart_id, diff_int
        ids = _sanitize_upload_ids(cid, df)
        if ids:
            chart_id, diff_int = ids
            out_name = f"{chart_id}_{diff_int}.mp4"
        else:
            out_name = f"video_{uuid.uuid4().hex[:8]}.mp4"
        return _safe_target_path(cache_dir, out_name)

    async def _stream_to(path: str, read_chunk) -> int:
        """把请求体流式写进临时文件再原子替换到目标路径，返回写入字节数。"""
        written = 0
        tmp_path = path + f".uploading_{os.getpid()}_{uuid.uuid4().hex[:8]}"
        with open(tmp_path, "wb") as f:
            while True:
                chunk = await read_chunk()
                if not chunk:
                    break
                f.write(chunk)
                written += len(chunk)
        try:
            if os.path.exists(path):
                os.remove(path)
        except OSError:
            pass
        os.replace(tmp_path, path)
        return written

    if "multipart/form-data" in content_type:
        reader = await request.multipart()
        field = await reader.next()
        while field is not None:
            if field.name == "request_id":
                req_id = (await field.text()).strip() or req_id
            elif field.name == "task_id":
                req_id = (await field.text()).strip() or req_id
            elif field.name == "chart_id":
                chart_id = (await field.text()).strip() or chart_id
            elif field.name == "diff":
                diff = (await field.text()).strip() or diff
            elif field.name in ("file", "video"):
                filename = field.filename or ""
                if not chart_id and "_" in filename:
                    base = os.path.splitext(filename)[0]
                    parts = base.split("_")
                    if len(parts) >= 2:
                        chart_id, diff = parts[0], parts[1]

                path = _prepare_target(chart_id, diff)
                if not path:
                    return web.json_response(
                        {"status": "error", "message": "invalid upload name"}, status=400)
                target_path = path
                file_bytes_written = await _stream_to(path, lambda: field.read_chunk(size=65536))
            field = await reader.next()
    else:
        path = _prepare_target(chart_id, diff)
        if not path:
            return web.json_response(
                {"status": "error", "message": "invalid upload name"}, status=400)
        target_path = path
        file_bytes_written = await _stream_to(path, lambda: request.content.read(65536))

    if not target_path or not os.path.isfile(target_path) or file_bytes_written == 0:
        return web.json_response({"status": "error", "message": "no video file received"}, status=400)

    logger.info(f"[PhoneBridge] 手机端视频上传成功: {target_path} "
                f"({file_bytes_written / (1024*1024):.2f} MB), req_id: {req_id}")

    # ---- 完整性守门：残缺短片绝不发进群 ----
    # 这一层与 get_cached_mp4 的校验互为补充：缓存校验管「已经躺在盘上的文件」，
    # 这里管「刚上传进来的文件」。两者任一拦住，用户最多看到一句重试提示，
    # 而绝不会收到一段 10 秒的残缺视频。
    #
    # 这里刻意 fail-closed —— 没有 chart_id/diff 就查不到该曲目的权威时长，
    # 也就无从判断完整与否。与其放行一个可能只有 10 秒的文件，不如直接拒收。
    # 手机端（encoder-worker.js）上传时始终会带上这两个参数。
    ids = _sanitize_upload_ids(chart_id, diff)
    upload_ok = False
    upload_reason = "missing_ids"
    upload_info: Dict[str, Any] = {}

    if not ids:
        logger.warning(
            f"[PhoneBridge] 上传未携带合法的 chart_id/diff（chart_id={chart_id!r} diff={diff!r}），"
            f"无法校验时长，拒绝入库：{os.path.basename(target_path)}"
        )
        # 这文件是以 video_<随机>.mp4 的兜底名落盘的，没有任何谱面归属，
        # 留着只会污染缓存目录，直接删掉。
        try:
            if target_path and os.path.isfile(target_path):
                os.remove(target_path)
        except OSError:
            pass
        if req_id:
            fut = _pending_requests.get(req_id)
            if fut and not fut.done():
                fut.set_result({
                    "status": "render_failed",
                    "error": "上传缺少 chart_id/diff，服务器无法校验视频完整性",
                })
        return web.json_response({
            "status": "error",
            "message": "chart_id and diff are required for upload",
            "reason": "missing_ids",
        }, status=422)

    chart_id, diff_int = ids
    try:
        upload_ok, upload_reason, upload_info = video_verify.verify_mp4(
            target_path, chart_id, diff_int, force=True, strict=True)
    except Exception as exc:
        # 校验模块自己出错时同样 fail-closed：宁可让用户重试，也不放出可能残缺的视频。
        logger.warning(f"[PhoneBridge] 上传视频校验异常，按拒绝处理: {exc}")
        upload_ok, upload_reason = False, f"verify_error: {exc}"

    if not upload_ok:
        logger.warning(
            f"[PhoneBridge] 上传的视频不合格，拒绝入库：{os.path.basename(target_path)} "
            f"reason={upload_reason} real={upload_info.get('real_ms')}ms "
            f"expected={upload_info.get('expected_ms')}ms ratio={upload_info.get('ratio')}"
        )
        video_verify.quarantine(target_path, upload_reason)
        # 明确告诉手机端失败原因，让它修好后重传；同时唤醒等待者去报「渲染失败」，
        # 免得群里一直静默等到超时。
        if req_id:
            fut = _pending_requests.get(req_id)
            if fut and not fut.done():
                fut.set_result({
                    "status": "render_failed",
                    "error": f"上传的视频时长异常（{upload_reason}）："
                             f"实际 {upload_info.get('real_ms')}ms，"
                             f"应为约 {upload_info.get('expected_ms')}ms",
                })
        return web.json_response({
            "status": "error",
            "message": "video duration mismatch",
            "reason": upload_reason,
            "real_ms": upload_info.get("real_ms"),
            "expected_ms": upload_info.get("expected_ms"),
            "ratio": upload_info.get("ratio"),
        }, status=422)

    if upload_reason == "skipped":
        logger.info(f"[PhoneBridge] 上传视频未做时长校验（{upload_info.get('note') or '无权威时长数据'}）")

    # 手机端的 WebCodecs 链路只编画面（encoder-worker.js 里没有 AudioEncoder），
    # 所以回传的 MP4 天生没音轨。在这里用服务器上的 ffmpeg 把音轨接上去：
    # -c:v copy，画面零损、时长帧数不变（video_verify 的时长校验仍然成立）。
    # 放到线程里跑，别让 4 秒的 ffmpeg 卡住整个 aiohttp 事件循环。
    # 任何失败都只是「这支没声音」，绝不阻断入库。
    if audio_mux is not None:
        try:
            muxed, mux_reason, mux_info = await asyncio.to_thread(
                audio_mux.apply_audio, target_path, chart_id)
        except Exception as exc:      # 补音轨自身出错不能影响主链路
            muxed, mux_reason, mux_info = False, "error", {"error": str(exc)}
        if muxed:
            file_bytes_written = os.path.getsize(target_path)
            logger.info(
                f"[PhoneBridge] 已补音轨：{os.path.basename(target_path)} "
                f"({mux_reason}, audio={os.path.basename(str(mux_info.get('audio') or ''))}, "
                f"size={file_bytes_written})")
        elif mux_reason in ("already_has_audio",):
            logger.info(f"[PhoneBridge] {os.path.basename(target_path)} 已有音轨，跳过")
        elif mux_reason in ("disabled", "skipped"):
            pass
        else:
            logger.warning(
                f"[PhoneBridge] 补音轨失败（{mux_reason}）：{os.path.basename(target_path)} "
                f"detail={mux_info} —— 成片仍按无声视频入库")

    # 唤醒等待者：先按 req_id 精准唤醒，再按 (chart_id, diff) 兜底。
    # 同一谱面可能被多个群同时请求，它们共享队列里的同一条任务，必须一起唤醒。
    result_payload = {
        "status": "success",
        "file_path": target_path,
        "size": file_bytes_written,
    }
    woken = 0
    if req_id and req_id in _pending_requests:
        fut = _pending_requests[req_id]
        if not fut.done():
            fut.set_result(dict(result_payload))
            woken += 1
    woken += _wake_pending_for(chart_id, diff_int, result_payload)

    # 顺手清掉该谱面还在排队的重复任务：成品已经出来了，再让手机重渲染一遍纯属浪费
    for t in [x for x in _render_tasks
              if x["chart_id"] == str(chart_id) and int(x["diff"]) == diff_int]:
        _render_tasks.remove(t)
    if woken == 0:
        logger.info("[PhoneBridge] 本次上传没有等待者（预渲染上传或请求已超时），文件已存入缓存")

    # 新链路下 Worker 已经把成品直接写进手机存储了，服务器这份只是「发群时顺手留下的中转副本」。
    # 所以这里不再反向命令手机下载一遍 —— 那是同一份字节在 WiFi 上走第二趟。
    # 这份副本由 LRU 缓存上限自然淘汰（见下方 evict_cache_lru）。

    # 服务器只是发群时的中转站，缓存超上限就按 LRU 淘汰最久没用过的。
    # keep 传刚落的这份：机器人可能正拿着它的 file:/// 路径往协议端投递。
    try:
        evict_cache_lru(keep=target_path)
    except Exception as e:      # 淘汰失败不能影响上传结果
        logger.warning(f"[PhoneBridge] 缓存淘汰异常: {e}")

    return web.json_response({
        "status": "ok",
        "message": "Upload success",
        "file_path": target_path,
        "size": file_bytes_written,
        "request_id": req_id,
    })


# ======================================================================
# 核心接口：向手机调取已预录的视频
# ======================================================================
async def request_video_from_phone(
    chart_id: str | int,
    diff: Optional[int] = None,
    timeout: Optional[float] = None,
) -> Tuple[bool, Optional[str], str]:
    """向在线手机节点调取已预录的谱面 MP4。

    返回三元组 (是否成功, 视频文件路径或 None, 状态原因)，原因取值：
      cache_hit      服务器本地已有缓存，直接返回，压根没打扰手机
      offline        没有手机 Agent 连着
      not_found      手机连上了，但本地没预录这条
      timeout        指令发出去了，超时没等到回传
      success        手机传完并已落盘
      render_failed  手机确实传了文件，但守门判定不合格（时长/谱面归属对不上）——
                     调用方要能把它和 not_found 区分开，才好决定是否转现场渲染
      error          内部异常

    为什么会超时：手机端用 HTTP POST 把文件推到 /upload，推完再通过 WebSocket
    发一条 video_uploaded 唤醒这里的 future（见 handle_ws）。所以这里只是「等通知」，
    大文件传输不会占用 WebSocket 通道。
    """
    cached = get_cached_mp4(chart_id, diff)
    if cached:
        return True, cached, "cache_hit"

    if not is_phone_online():
        return False, None, "offline"

    req_id = f"req_{int(time.time()*1000)}_{chart_id}_{diff if diff is not None else 'all'}_{uuid.uuid4().hex[:6]}"
    future: asyncio.Future = asyncio.get_running_loop().create_future()
    _pending_requests[req_id] = future
    _pending_key[req_id] = (str(chart_id), int(diff)) if diff is not None else (str(chart_id), -1)

    if timeout is None:
        timeout = float(getattr(cfg, "PHONE_VIDEO_TIMEOUT_S", 60))

    # Agent 侧字段名兼容：event/action 双写，request_id/task_id 双写
    payload = {
        "event": "request_video",
        "action": "request_video",
        "request_id": req_id,
        "task_id": req_id,
        "chart_id": str(chart_id),
        "diff": diff,
        "timestamp": time.time(),
    }

    send_count = 0
    for ws in list(_connected_clients):
        if not ws.closed:
            try:
                await ws.send_json(payload)
                send_count += 1
            except Exception as e:
                logger.warning(f"Failed to send request to phone WS: {e}")

    if send_count == 0:
        _pending_requests.pop(req_id, None)
        _pending_key.pop(req_id, None)
        return False, None, "offline"

    logger.info(f"[PhoneBridge] 已向 {send_count} 个手机节点下发视频调取任务: "
                f"chart={chart_id}, diff={diff}, req_id={req_id}")

    try:
        result = await asyncio.wait_for(future, timeout=timeout)
        status = result.get("status")
        if status == "success":
            fp = result.get("file_path")
            if not fp or not os.path.isfile(fp):
                # Agent 可能只回了 size，实际文件路径以本地缓存为准
                fp = get_cached_mp4(chart_id, diff)
            if fp and os.path.isfile(fp):
                return True, fp, "success"
            return False, None, "error"
        if status == "not_found":
            return False, None, "not_found"
        if status == "render_failed":
            # 手机确实回传了文件，但守门判定不合格（时长对不上 / 缺谱面归属）。
            # 这不是「手机没预录」，调用方要能区分出来，才能转走现场渲染。
            return False, None, "render_failed"
        return False, None, "error"

    except asyncio.TimeoutError:
        logger.warning(f"[PhoneBridge] 等待手机节点回传视频超时 (超时阈值: {timeout}s), req_id={req_id}")
        return False, None, "timeout"
    except Exception as e:
        logger.exception(f"等待手机视频回传异常: {e}")
        return False, None, "error"
    finally:
        _pending_requests.pop(req_id, None)
        _pending_key.pop(req_id, None)


# ======================================================================
# 成品「存回手机」：让手机成为视频仓库，而不是永远只往外掏
# ======================================================================
def _store_url_for_phone(name: str) -> str:
    """给手机用的下载地址。手机从局域网访问 8778，所以不能用 127.0.0.1。"""
    token = getattr(cfg, "PHONE_BRIDGE_TOKEN", "")
    q = urlencode({"token": token}) if token else ""
    return f"{_bridge_base_for_phone()}/video/{quote(name)}" + (f"?{q}" if q else "")


async def request_phone_store(
    chart_id: str | int,
    diff: int,
    timeout: Optional[float] = None,
) -> Tuple[bool, str]:
    """命令手机把服务器上这份成品下载下来归档到手机存储。

    返回 (是否成功, 说明)。

    为什么是手机来拉而不是服务器推：手机在 NAT 后面，服务器连不进去；
    而手机的 Agent 本来就在跑，让它主动 GET 是最省事的通道。所以服务器
    在 8778 上开一个只读的 /video/<文件名> 端点（要 token），Agent 收到
    store_video 指令后去拉，落盘成功再回一条 video_stored。

    只有手机确认存好了，调用方才该删服务器副本——顺序反了就会丢片。
    """
    path = get_cached_mp4(chart_id, diff)
    if not path:
        return False, "服务器上没有这份成品，无法归档"

    if not is_phone_online():
        return False, "手机 Agent 不在线"

    if timeout is None:
        timeout = float(getattr(cfg, "PHONE_STORE_TIMEOUT_S", 300))

    name = os.path.basename(path)
    size = os.path.getsize(path)
    storage_id = f"st_{int(time.time()*1000)}_{chart_id}_{diff}_{uuid.uuid4().hex[:6]}"

    future: asyncio.Future = asyncio.get_running_loop().create_future()
    _store_requests[storage_id] = future

    payload = {
        "event": "store_video",
        "action": "store_video",
        "storage_id": storage_id,
        "request_id": storage_id,      # 老版 Agent 只认 request_id
        "task_id": storage_id,
        "url": _store_url_for_phone(name),
        "dir": getattr(cfg, "PHONE_STORE_DIR", "/sdcard/maimai_videos"),
        "filename": name,
        "size": size,
        "chart_id": str(chart_id),
        "diff": int(diff),
        "timestamp": time.time(),
    }

    send_count = 0
    for ws in list(_connected_clients):
        if not ws.closed:
            try:
                await ws.send_json(payload)
                send_count += 1
            except Exception as e:
                logger.warning(f"Failed to send store command to phone WS: {e}")

    if send_count == 0:
        _store_requests.pop(storage_id, None)
        return False, "没有可用的手机连接"

    logger.info(f"[PhoneBridge] 已下发成品归档指令: {name} ({size} B) -> 手机 {payload['dir']}")

    try:
        result = await asyncio.wait_for(future, timeout=timeout)
        if result.get("ok"):
            logger.info(f"[PhoneBridge] 手机已归档成品: {name} -> {result.get('path') or payload['dir']}")
            return True, ""
        reason = result.get("error") or "手机未说明原因"
        logger.warning(f"[PhoneBridge] 手机归档成品失败: {name} — {reason}")
        return False, reason
    except asyncio.TimeoutError:
        logger.warning(f"[PhoneBridge] 等待手机归档成品超时 ({timeout}s): {name}")
        return False, "手机归档超时"
    except Exception as e:
        logger.exception(f"等待手机归档成品异常: {e}")
        return False, f"内部异常: {e}"
    finally:
        _store_requests.pop(storage_id, None)


def _archived_index_path() -> str:
    """「手机已归档」清单的落盘位置（放在缓存目录下，跟着缓存一起管理）。"""
    return os.path.join(_ensure_cache_dir(), "_archived_index.json")


def load_archived_index() -> Dict[str, Dict[str, Any]]:
    """读出「手机已存过哪些成品」的清单，键是 `<曲id>_<槽位>`。

    为什么需要这份清单：清扫过一轮之后，服务器上就没有那份文件了，
    光看缓存目录无法区分「手机已经有了」和「压根没渲染过」。批量预渲染
    必须跳过手机已有的，否则每跑一次都从头重编 2000 首。
    """
    path = _archived_index_path()
    if not os.path.isfile(path):
        return {}
    try:
        # utf-8-sig 而不是 utf-8：这份清单难免被人工编辑（例如剔掉某一支重做），
        # 而 Windows PowerShell 的 `Set-Content -Encoding UTF8` 会写 BOM。
        # 带 BOM 的文件用 utf-8 读会直接 ValueError，于是整份清单被当成空的 ——
        # 表现就是「已存数量突然从 38 掉到 2」，然后批量把做过的一遍全重做。
        with open(path, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError) as e:
        logger.warning(f"[PhoneBridge] 归档清单读取失败，按空处理: {e}")
        return {}


def mark_archived(chart_id: str | int, diff: int, size: int = 0) -> None:
    """记一笔「这份成品已经在手机上了」。写完立即落盘，避免重启丢账。"""
    path = _archived_index_path()
    index = load_archived_index()
    index[f"{chart_id}_{int(diff)}"] = {
        "chart_id": str(chart_id),
        "diff": int(diff),
        "size": int(size),
        "at": time.time(),
    }
    try:
        tmp = path + f".tmp_{uuid.uuid4().hex[:6]}"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(index, f, ensure_ascii=False)
        os.replace(tmp, path)
    except OSError as e:
        logger.warning(f"[PhoneBridge] 归档清单写入失败: {e}")


async def archive_cached_to_phone(chart_id: str | int, diff: int) -> Tuple[bool, str]:
    """让手机把服务器上这份成品也存一份。

    只在「服务器有、手机没有」的历史遗留场景用到（早期手工灌进服务器的片子）。
    新链路下 Worker 渲染完就直接写进手机存储了，根本不需要这条。

    成功后记一笔账，代表「手机已有」，是批量预渲染的跳过依据。
    服务器副本不删 —— 它由 LRU 上限自然淘汰，不需要一个后台清扫器。
    """
    if not getattr(cfg, "PHONE_STORE_ENABLED", True):
        return False, "归档功能已关闭"

    ok, reason = await request_phone_store(chart_id, diff)
    if not ok:
        return False, reason

    path = get_cached_mp4(chart_id, diff)
    if not path:
        return False, "归档成功后找不到本地副本"
    try:
        size = os.path.getsize(path)
    except OSError:
        size = 0
    mark_archived(chart_id, diff, size)
    return True, ""


# ======================================================================
# 批量预渲染：一次把一大批谱面推给手机编，编完手机自己就存好了
# ======================================================================
# 动机：日常被点的曲子来来去去就那几十首，但用户真正想要的是「手机里
# 躺着一整套常用曲目」——服务器随时能调，不必每次现编一分半钟。
#
# 职责划分（这是这套设计的关键）：
#   服务器  —— 手上有 catalog（哪首有哪些难度），负责算清单、把任务推进队列。
#   手机    —— 自己领任务、自己编、自己写盘。不需要服务器逐条盯着。
# 服务器只在需要报进度时对一次账，绝不站在中间当同步调度器。
_batch_state: Dict[str, Any] = {
    "running": False,
    "total": 0,
    "done": 0,
    "failed": 0,
    "skipped": 0,
    "current": None,
    "started_at": 0.0,
    "finished_at": 0.0,
    "stop_requested": False,
    "errors": [],
}
_batch_task: Optional[asyncio.Task] = None


def _batch_auto_path() -> str:
    """批量任务的「待续跑」标记文件。

    为什么需要它：机器人跑在 Windows 计划任务里（登录时触发、仅交互式），
    RDP 断线重连、系统更新、手动重启都会让进程重来一遍，内存里的批量状态
    就没了。之前每次重启都要人工重新 POST 一次 /api/batch 才继续，很容易忘。

    做法：启动批量时把参数落盘，正常跑完（或用户主动停）就删掉。
    进程重启后如果还留着这个文件，说明是「非正常中断」，自动续跑。
    真正的去重靠 _archived_index.json —— 已经做完的条目会被跳过，
    所以续跑不会重编一遍。
    """
    return os.path.join(getattr(cfg, "MP4_CACHE_DIR", "."), "_batch_auto.json")


def _save_batch_auto(slots, limit, item_timeout) -> None:
    try:
        path = _batch_auto_path()
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump({
                "slots": slots,
                "limit": limit,
                "item_timeout": item_timeout,
                "started_at": time.time(),
            }, f, ensure_ascii=False)
    except Exception as e:
        logger.warning(f"[PhoneBridge] 写入批量续跑标记失败（不影响运行）: {e}")


def _clear_batch_auto() -> None:
    try:
        path = _batch_auto_path()
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        logger.warning(f"[PhoneBridge] 清理批量续跑标记失败: {e}")


async def resume_batch_if_needed() -> None:
    """进程启动时检查有没有「中断的批量任务」，有就自动接上。

    这解决的是「机器人一重启，两千条的批量就停在原地、没人知道」的问题。
    """
    path = _batch_auto_path()
    if not os.path.exists(path):
        return
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
    except Exception as e:
        logger.warning(f"[PhoneBridge] 批量续跑标记损坏，已忽略: {e}")
        _clear_batch_auto()
        return

    slots = data.get("slots")
    limit = int(data.get("limit") or 0)
    item_timeout = float(data.get("item_timeout") or 600.0)
    # 给手机工作页一点上线时间：进程刚起来时它还在重连
    for _ in range(30):
        if is_worker_alive() or is_phone_online():
            break
        await asyncio.sleep(2.0)

    ok, msg, count = await start_batch(
        slots=slots, limit=limit, item_timeout=item_timeout, resume=True
    )
    if ok:
        logger.info(f"[PhoneBridge] 检测到中断的批量任务，已自动续跑：{count} 条")
    else:
        logger.warning(f"[PhoneBridge] 批量自动续跑失败（{msg}），保留标记等下次启动再试")


def get_batch_info() -> Dict[str, Any]:
    """给 /status 用的批量进度概览。"""
    info = dict(_batch_state)
    total = info.get("total") or 0
    processed = (info.get("done") or 0) + (info.get("failed") or 0) + (info.get("skipped") or 0)
    info["processed"] = processed
    info["percent"] = round(processed * 100.0 / total, 1) if total else 0.0
    if info.get("running") and info.get("started_at"):
        elapsed = time.time() - float(info["started_at"])
        info["elapsed_s"] = round(elapsed, 1)
        if processed:
            per = elapsed / processed
            info["eta_s"] = round(per * (total - processed), 1)
    # errors 只留最近几条，免得 /status 被撑爆
    info["errors"] = info.get("errors", [])[-5:]
    return info


def build_batch_manifest(
    slots: Optional[List[int]] = None,
    limit: int = 0,
    skip_archived: bool = True,
) -> List[Tuple[str, int]]:
    """从 catalog 生成待预渲染清单，返回 [(曲id, 难度槽位), ...]。

    默认跳过「已经归档到手机」的条目（见 load_archived_index），否则每跑
    一轮都要把两千首从头再编一遍。
    """
    if slots is None:
        slots = [5]
    # 显式传空列表（如 slots=）视为「没给难度」，返回空清单而不是偷偷退回默认值 ——
    # 否则用户写了 slots= 却拿到 1779 首紫谱，会莫名其妙。
    slots = sorted(set(int(s) for s in slots) & set(_VALID_DIFF_SLOTS))
    if not slots:
        return []

    entries: List[Dict[str, Any]] = []
    try:
        if _alias_resolve is not None:
            entries = _alias_resolve._load_catalog().get("entries") or []  # type: ignore[attr-defined]
    except Exception as e:
        logger.warning(f"[PhoneBridge] 批量清单读取 catalog 失败: {e}")
        entries = []

    archived = load_archived_index() if skip_archived else {}
    manifest: List[Tuple[str, int]] = []
    for entry in entries:
        sid = str(entry.get("short_id") or entry.get("slug") or "").strip()
        if not sid:
            continue
        have = {int(d.get("slot", -1)) for d in entry.get("difficulties") or []}
        for slot in slots:
            if slot not in have:
                continue
            if f"{sid}_{slot}" in archived:
                continue
            manifest.append((sid, slot))

    manifest.sort(key=lambda x: (int(x[0]) if x[0].isdigit() else 0, x[1]))
    if limit and limit > 0:
        manifest = manifest[:limit]
    return manifest


def _phone_files_via_adb(timeout: float = 6.0) -> Optional[List[str]]:
    """通过 adb 列手机落盘目录的文件名（仅在没有其它办法时用）。

    注意：这条路只有「服务器和手机连在同一台电脑上」时才成立。正式部署时
    服务器在云上，看不到手机，这时应当由手机主动上报（/api/stored）或
    把 save_server 暴露到局域网。这里保留它作为本机调试的兜底。
    """
    adb = shutil.which("adb") or r"C:\Users\Administrator\platform-tools\adb.exe"
    if not os.path.exists(adb):
        return None
    try:
        proc = subprocess.run(
            [adb, "shell", f"ls {cfg.PHONE_STORE_DIR}/*.mp4 2>/dev/null"],
            capture_output=True, timeout=timeout,
        )
        if proc.returncode not in (0, 1):
            return None
        text = proc.stdout.decode("utf-8", "replace")
        return [os.path.basename(line.strip()) for line in text.splitlines() if line.strip()]
    except Exception:
        return None


async def _list_phone_files(timeout: float = 6.0) -> Optional[List[str]]:
    """手机的落盘目录里现在有哪些 mp4。

    这里刻意**不**去连手机的 8780 端口。原因：服务器在云上，手机在 NAT 后
    且 8780 只监听手机自己的回环地址，服务器无论如何都连不进去 —— 唯一能碰到的
    方式是借 adb reverse 中转，那又回到「依赖一台连了手机的电脑」的老问题。

    所以「手机上有哪些文件」只有一条可靠路径：手机自己上报（Worker 存完直接
    POST /api/stored、Termux Agent 回 video_stored）。服务器不相信自己的探测能力。

    保留本机调试用的 adb 兜底，但那不是生产路径。
    """
    return await asyncio.get_event_loop().run_in_executor(None, _phone_files_via_adb)


async def _run_batch(manifest: List[Tuple[str, int]], item_timeout: float) -> None:
    """把整批任务一次性推给手机，然后撒手 —— 不再一条条监督。

    为什么不做「发一条、等一条、再发下一条」：手机工作页本来就是自己按
    队列串行编码的，服务器杵在中间逐条等待只是把一条本来能全速跑的生产线
    卡成同步调用。服务器手上有 catalog，它该干的活是**算清单**；算完把
    任务全推进队列，手机自己领、自己编、自己存盘，服务器只在需要时查进度。

    判定「这条做完了没有」用两路证据，谁先到算谁：
      1. 手机存完主动 POST /api/stored（正常路径）
      2. 服务器自己去数手机目录里的文件（通知丢了时的兜底）
    两路都没有就当失败，但这不影响后面任务的推进 —— 后面的早就发出去了。
    """
    global _batch_task
    st = _batch_state
    st.update({
        "running": True, "total": len(manifest), "done": 0, "failed": 0, "skipped": 0,
        "current": None, "started_at": time.time(), "finished_at": 0.0,
        "stop_requested": False, "errors": [],
    })
    logger.info(f"[PhoneBridge] 批量预渲染开始，共 {len(manifest)} 条")

    queued: List[Tuple[str, int, str]] = []
    try:
        # ---- 第一步：一次性把清单推进渲染队列 ----
        archived = load_archived_index()
        for idx, (cid, slot) in enumerate(manifest):
            if st.get("stop_requested"):
                break
            # 服务器缓存里已经有、且手机那侧没有记录的，让它自己存一份。
            # 新链路下 Worker 直接写手机，不需要再从服务器下载一遍。
            if get_cached_mp4(cid, slot) and f"{cid}_{slot}" not in archived:
                ok, reason = await archive_cached_to_phone(cid, slot)
                if ok:
                    st["skipped"] += 1
                else:
                    st["failed"] += 1
                    st["errors"].append(f"{cid}_{slot}: 归档失败 {reason}")
                continue
            if f"{cid}_{slot}" in archived:
                st["skipped"] += 1
                continue

            req_id = f"batch_{int(time.time()*1000)}_{cid}_{slot}"
            await enqueue_render_task(cid, slot, req_id)
            queued.append((cid, slot, req_id))

        logger.info(f"[PhoneBridge] 批量已全部下发 {len(queued)} 条，"
                    f"跳过 {st['skipped']} 条，开始盯进度")

        # ---- 第二步：只查进度，不再干预 ----
        # 手机自己在跑，这里每 10 秒对一次账：手机目录里多了哪些、队列里还剩哪些。
        pending = {(cid, slot) for cid, slot, _ in queued}
        deadline = time.time() + item_timeout * max(1, len(queued))
        while pending and time.time() < deadline:
            if st.get("stop_requested"):
                break
            await asyncio.sleep(10.0)

            idx_now = load_archived_index()
            names = await _list_phone_files()
            for cid, slot in list(pending):
                if f"{cid}_{slot}" in idx_now or (names is not None and f"{cid}_{slot}.mp4" in names):
                    pending.discard((cid, slot))
                    st["done"] += 1
                    if f"{cid}_{slot}" not in idx_now:
                        mark_archived(cid, slot, 0)
                    logger.info(f"[PhoneBridge] 批量完成 {st['done']}/{len(queued)}: {cid}_{slot}")
                else:
                    st["current"] = {"chart_id": cid, "diff": slot, "index": st["done"] + 1}

            # 手机工作页没了就早点收摊，别耗到宇宙尽头
            if not is_worker_alive() and not is_phone_online():
                logger.warning("[PhoneBridge] 批量中止：手机节点与工作页都不在线了")
                break

        for cid, slot in pending:
            st["failed"] += 1
            st["errors"].append(f"{cid}_{slot}: 未在手机目录中出现")
            logger.warning(f"[PhoneBridge] 批量未出片: {cid}_{slot}")
    except asyncio.CancelledError:
        logger.info("[PhoneBridge] 批量预渲染任务被取消")
        raise
    except Exception as e:
        logger.exception(f"[PhoneBridge] 批量预渲染异常: {e}")
        st["errors"].append(f"批量异常: {e}")
    finally:
        st["running"] = False
        st["current"] = None
        st["finished_at"] = time.time()
        _batch_task = None
        # 跑完了（或被主动叫停）就把续跑标记删掉；
        # 只有进程被外部杀掉时标记才会留下来，下次启动据此自动续跑。
        _clear_batch_auto()
        logger.info(
            f"[PhoneBridge] 批量预渲染结束：成功 {st['done']} / 跳过 {st['skipped']} / "
            f"失败 {st['failed']}（共 {st['total']}）"
        )


async def start_batch(
    slots: Optional[List[int]] = None,
    limit: int = 0,
    item_timeout: float = 600.0,
    skip_archived: bool = True,
    resume: bool = False,
) -> Tuple[bool, str, int]:
    """启动批量预渲染，返回 (是否启动, 说明, 清单条数)。

    resume=True 是进程重启后的自动续跑：此时不是用户主动发起的，
    要额外做两件事 —— 允许清单为空（说明其实已经跑完了）、
    不要覆盖已有的续跑标记。
    """
    global _batch_task
    if _batch_state.get("running"):
        return False, "已经有一个批量任务在跑", 0
    if not getattr(cfg, "PHONE_RENDER_ENABLED", True):
        return False, "按需渲染已关闭（PHONE_RENDER_ENABLED=False）", 0
    if not is_worker_alive():
        return False, "手机工作页不在线，先在手机 Chrome 打开 worker.html", 0

    manifest = build_batch_manifest(slots=slots, limit=limit, skip_archived=skip_archived)
    if not manifest:
        if resume:
            # 上一次其实已经跑完了，只是没走到清理标记那一步
            _clear_batch_auto()
            return False, "清单为空，视为已全部完成，已清理续跑标记", 0
        return False, "清单为空（要么都已在手机上，要么这些难度在曲库里不存在）", 0

    if not resume:
        _save_batch_auto(slots, limit, item_timeout)

    _batch_task = asyncio.get_running_loop().create_task(_run_batch(manifest, item_timeout))
    return True, "批量预渲染已启动", len(manifest)


def stop_batch() -> bool:
    """请求停止批量（当前这条会跑完再停）。"""
    if not _batch_state.get("running"):
        # 没在跑也顺手清掉续跑标记，否则下次启动会自己又跑起来
        _clear_batch_auto()
        return False
    _batch_state["stop_requested"] = True
    _clear_batch_auto()
    return True


async def handle_api_batch(request: web.Request) -> web.Response:
    """批量预渲染接口。

    GET  /api/batch                        查进度
    POST /api/batch?slots=5,6,7&limit=30   启动（slots 默认 5；limit 0 = 不限）
    POST /api/batch?stop=1                 请求停止
    """
    if not _check_token(request):
        return web.json_response({"status": "error", "message": "unauthorized"}, status=403)

    if request.method == "POST":
        q = request.query
        if q.get("stop") in ("1", "true", "yes"):
            stopped = stop_batch()
            return web.json_response({
                "status": "ok" if stopped else "noop",
                "message": "已请求停止" if stopped else "当前没有批量任务在跑",
            })

        raw_slots = q.get("slots") or "5"
        try:
            slots = [int(s) for s in raw_slots.split(",") if s.strip()]
        except ValueError:
            return web.json_response({
                "status": "error", "message": f"slots 必须是逗号分隔的数字，收到 {raw_slots!r}",
            }, status=422)
        bad = [s for s in slots if s not in _VALID_DIFF_SLOTS]
        if bad:
            return web.json_response({
                "status": "error",
                "message": f"难度槽位只认 2-7，不认 {bad}",
            }, status=422)

        try:
            limit = int(q.get("limit", 0))
            item_timeout = float(q.get("item_timeout", 600))
        except ValueError:
            return web.json_response({"status": "error", "message": "limit/item_timeout 必须是数字"},
                                     status=422)

        ok, msg, count = await start_batch(slots=slots, limit=limit, item_timeout=item_timeout)
        return web.json_response({
            "status": "ok" if ok else "error",
            "message": msg,
            "count": count,
        }, status=200 if ok else 409)

    return web.json_response({"status": "ok", "batch": get_batch_info()})

# ======================================================================
# 按需渲染：手机没预录时，让手机浏览器现场编码
# ======================================================================
def _guess_lan_ip() -> str:
    """探测本机默认出口网卡的 IPv4（手机回传视频时可能用到）。"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        # 目标不要求可达，只是借它让内核挑出默认出口网卡
        s.connect(("223.5.5.5", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def _bridge_base_for_phone() -> str:
    """手机侧访问本桥（8778）时应该用的基地址。

    服务器已经搬上云，手机和它不在同一个局域网，所以这个地址不能再靠
    「探测本机局域网 IP」猜 —— 猜出来的会是阿里云内网地址（172.26.x.x），
    手机连不上。改用配置项 PHONE_BRIDGE_PUBLIC_HOST 明确指定公网地址或域名。

    没配时退回探测本机出口 IP：本机自测、或服务器与手机确实同局域网时仍可用，
    但云上必须配置。

    为什么只有桥接口（8778）需要这个地址：渲染页与落盘服务全在手机自己的
    127.0.0.1 上（见 phone_client/render_server.py），手机取任务、存成品都不出
    手机；只有「通知服务器我存好了」和「把成品传上去发群」这两步需要知道
    服务器在哪。
    """
    port = getattr(cfg, "PHONE_BRIDGE_PORT", 8778)
    host = (getattr(cfg, "PHONE_BRIDGE_PUBLIC_HOST", "") or "").strip()
    if host:
        return f"http://{host}:{port}"
    return f"http://{_guess_lan_ip()}:{port}"


def worker_page_url() -> str:
    """拼出「手机常驻渲染工作页」的 URL，供提示语直接发给用户。

    这个地址是**手机自己**的 127.0.0.1，由 Termux 里的 render_server.py 提供
    （见 phone_client/render_server.py）。渲染器文件就躺在手机磁盘上，
    所以既不需要服务器托管，也不需要 `adb reverse` 做中转。

    为什么必须是 127.0.0.1：WebCodecs 的 VideoEncoder 只在安全上下文里存在。
    `http://localhost` / `http://127.0.0.1` 算安全上下文，`http://公网IP` 不算 ——
    走局域网地址或域名（没有 HTTPS）时浏览器会直接隐藏 VideoEncoder，
    编码页必失败。手机访问自己的回环地址天然满足，这也是把渲染器搬到手机上的
    根本理由：服务器搬到云上之后，adb reverse 那条路就走不通了。
    """
    base = (getattr(cfg, "PHONE_RENDER_BASE", "http://127.0.0.1:8777") or "").rstrip("/")
    token = getattr(cfg, "PHONE_BRIDGE_TOKEN", "")
    q = urlencode({
        "bridge": _bridge_base_for_phone(),
        "token": token,
        "px": str(getattr(cfg, "PHONE_RENDER_PX", 720)),
        "fps": str(getattr(cfg, "PHONE_RENDER_FPS", 60)),
        "bitrate": str(getattr(cfg, "PHONE_RENDER_BITRATE", 4_000_000)),
    })
    return f"{base}/worker.html?{q}"


def build_render_url(chart_id: str | int, diff: int, request_id: str = "") -> str:
    """拼出手机工作页领取到的「单曲渲染任务」URL。

    指向 `encoder-worker.js` —— 一个把渲染引擎与 60fps 编码全放进 Web Worker
    的编码器。工作页取到任务后直接 new Worker(这个 URL)，由 Worker 在后台逐帧
    编码出 MP4。

    == 这些文件在哪 ==
    所有渲染器（worker.html / encoder-worker.js / render-bundle.js）都躺在
    手机磁盘上，由手机 Termux 里的 render_server.py 从 127.0.0.1:8777 提供。
    服务器不托管它们，也就不需要 8777 端口对任何地方可达。

    谱面数据（`/charts/<id>.txt`）也由同一个服务供给：手机本地有就读本地，
    没有就由手机直连 adxdls.saop.cc 拉一次并缓存。服务器不参与。

    == 成品去哪儿 ==
    Worker 编完不往服务器 POST 视频字节，而是 POST 到手机上的 `/save`
    （127.0.0.1:8780，同一个 render_server.py），落进
    /sdcard/Download/maimai/<曲id>_<难度>.mp4。这条请求走 loopback，
    一个字节都出不了手机，也不需要用户点一下（Android Chrome 的 a[download]
    没手势不生效，实测点了也存不下来）。

    为什么要绕这一圈而不能用 Blob 直接 saveAs：同上前提，无人值守点不动。

    存好之后由 render_server 顺带 POST /api/stored 通知本桥 —— 只带元数据
    （名字/路径/大小），不带视频本体。服务器据此记账，需要发群时再让
    Termux Agent 把这支传上来（QQ 协议端只认服务器上的文件，这一趟绕不开）。

    为什么必须是 Worker 而不是普通页面：主线程编码只要页面一进后台就被 Chrome
    节流，实测精确冻结在第 5431 帧（encodeQueueSize 恒定不再变化）；同样的活儿
    放进 Worker，页面全程 hidden 也能跑完全曲（实测 9850 帧 / 94 秒 / 52 MB，
    比实时快约 1.7 倍）。这条差异是整个「不用一直亮屏盯着」方案的地基，
    详见 server/encoder-worker.js 的文件头。
    """
    base = (getattr(cfg, "PHONE_RENDER_BASE", "http://127.0.0.1:8777") or "").rstrip("/")

    token = getattr(cfg, "PHONE_BRIDGE_TOKEN", "")
    name = f"{chart_id}_{int(diff)}.mp4"

    q = {
        "id": str(chart_id),
        "diff": str(int(diff)),
        "px": str(getattr(cfg, "PHONE_RENDER_PX", 720)),
        "fps": str(getattr(cfg, "PHONE_RENDER_FPS", 60)),
        "bitrate": str(getattr(cfg, "PHONE_RENDER_BITRATE", 4_000_000)),
        # 成品落在手机上（loopback，不出手机）。地址可用 PHONE_SAVE_URL 覆盖。
        "save": getattr(cfg, "PHONE_SAVE_URL", "") or "http://127.0.0.1:8780/save",
        # 存好后通知本桥（服务器公网地址，手机主动 POST 过来）
        "notify": f"{_bridge_base_for_phone()}/api/stored?{urlencode({'token': token})}"
                  + (f"&request_id={request_id}" if request_id else ""),
        "name": name,
    }

    # 音轨地址：手机不知道每首歌的音轨在哪个分片目录下（catalog.json 在服务器
    # 上），所以由服务器查好一并下发。手机拿去之后不是直接 fetch——上游没有
    # CORS 头，页面直连会被挡——而是交给本机 render_server.py 的同源代理
    # /audio/<id>.mp3?src=... 代下并缓存，详见 encoder-worker.js 里的说明。
    if getattr(cfg, "PHONE_AUDIO_MUX_ENABLED", True) and audio_mux is not None:
        try:
            audio_url = audio_mux.catalog_audio_url(chart_id)
        except Exception:
            audio_url = None
        if audio_url:
            q["audio"] = audio_url

    return f"{base}/encoder-worker.js?{urlencode(q)}"


async def request_render_on_phone(
    chart_id: str | int,
    diff: Optional[int] = None,
    timeout: Optional[float] = None,
) -> Tuple[bool, Optional[str], str]:
    """让手机现场渲染该谱面并回传 60fps MP4。

    与 request_video_from_phone 的区别：本函数应对「手机上也没有成品」的情况 ——
    把任务排进渲染队列，手机浏览器里常驻的 worker.html 轮询 /api/task 取走任务，
    在页面内用 WebCodecs 逐帧编码。

    == 成品先落手机，再按需拉一次 ==
    Worker 编完直接 POST 到手机本地的 save_server.py（loopback），落进
    /sdcard/Download/maimai/，然后 POST /api/stored 通知本桥。本函数收到通知后
    再让 Termux Agent 把这支传上来 —— QQ 协议端要的是服务器上的文件，这一趟
    绕不开；但归档那一趟（服务器再推回手机）彻底省掉了，同一份字节只在
    WiFi 上走一遍。

    为什么不让 Termux Agent 去拉起浏览器：Android 10+ 及 MIUI 会拦截后台应用
    startActivity，实测 am start 报 java.lang.reflect.InvocationTargetException
    （code=1）。worker 页主动拉取不依赖任何后台启动能力，是唯一稳的通道。

    返回三元组 (是否成功, 视频文件路径或 None, 状态原因)，原因取值：
      cache_hit  本地已有缓存
      error      参数不合法（没给难度，属调用方缺陷）
      offline    既没有 Agent 在线，也没有工作页在轮询
      timeout    等到超时（仍会再查一次缓存，手机上可能已经传完了）
      success    成功
    """
    cached = get_cached_mp4(chart_id, diff)
    if cached:
        return True, cached, "cache_hit"

    if diff is None:
        # 没有难度就没有权威时长可校验，产物也无法命名。调用方（mai_preview.py）
        # 一律传入已解析的界面难度；走到这里说明是程序缺陷，直接失败比默默按
        # Master(5) 渲染出与按钮文案不符的视频更安全。
        logger.warning(f"[PhoneBridge] 渲染请求缺少难度 (chart_id={chart_id})，已拒绝")
        return False, None, "error"

    # 必须有人干活：Termux Agent 在线（能回传已录视频）或浏览器工作页在轮询（能现场渲染）。
    # 两者都不在就不要傻等超时 —— 那只会让群里白等 15 分钟。
    if not is_phone_online() and not is_worker_alive():
        return False, None, "offline"

    if timeout is None:
        timeout = float(getattr(cfg, "PHONE_RENDER_TIMEOUT_S", 900))

    req_id = f"rnd_{int(time.time()*1000)}_{chart_id}_{diff}_{uuid.uuid4().hex[:6]}"
    future: asyncio.Future = asyncio.get_running_loop().create_future()
    _pending_requests[req_id] = future
    _pending_key[req_id] = (str(chart_id), int(diff))

    # 入队，等手机常驻工作页（worker.html）来拉取。
    # 这里刻意不再向 Termux Agent 广播 launch_url：Android 10+/MIUI 必然拦截
    # 后台进程拉起浏览器（实测 am start 直接报错）；worker 页主动轮询才可靠。
    task = await enqueue_render_task(chart_id, int(diff), req_id)

    logger.info(f"[PhoneBridge] 已排入手机渲染队列: chart={chart_id}, diff={diff}, req_id={req_id}")
    logger.info(f"[PhoneBridge] 手机工作页将加载: {build_render_url(chart_id, int(diff), task['request_id'])}")
    if not is_worker_alive():
        logger.warning("[PhoneBridge] 当前没有手机工作页在轮询 —— 渲染会等到超时。"
                       "请在手机 Chrome 打开 worker.html 并保持常驻。")

    try:
        result = await asyncio.wait_for(future, timeout=timeout)
        status = result.get("status")
        if status == "success":
            fp = result.get("file_path")
            if not fp or not os.path.isfile(fp):
                fp = get_cached_mp4(chart_id, diff)
            if fp and os.path.isfile(fp):
                return True, fp, "success"
            return False, None, "error"

        if status == "stored":
            # 手机已经把这支编好并存进自己存储了，但服务器手上还没有字节。
            # 发群必须用服务器上的文件，所以这里要再拉一趟（仅此一趟）。
            logger.info(f"[PhoneBridge] 手机上已存好 {chart_id}_{diff}.mp4，"
                        f"正在拉回服务器用于发群")
            ok, fp, why = await request_video_from_phone(
                chart_id, int(diff),
                timeout=float(getattr(cfg, "PHONE_VIDEO_TIMEOUT_S", 180)),
            )
            if ok and fp:
                return True, fp, "success"
            logger.warning(f"[PhoneBridge] 从手机拉回成品失败: {why}")
            return False, None, "error"

        return False, None, status or "error"
    except asyncio.TimeoutError:
        logger.warning(f"[PhoneBridge] 等待手机现场渲染超时 ({timeout}s), req_id={req_id}")
        # 就算超时，手机也可能已经把文件传上来了，再查一次缓存
        fp = get_cached_mp4(chart_id, diff)
        if fp:
            return True, fp, "success"
        return False, None, "timeout"
    except Exception as e:
        logger.exception(f"等待手机现场渲染异常: {e}")
        return False, None, "error"
    finally:
        _pending_requests.pop(req_id, None)
        _pending_key.pop(req_id, None)


async def handle_api_task(request: web.Request) -> web.Response:
    """手机常驻工作页（worker.html）轮询拉取待渲染任务。

    返回：
      {"status":"ok","task":{...}}  —— 有任务
      {"status":"ok","task":null}   —— 队列为空，worker 稍后再问

    鉴权走 _check_token；worker 页把 token 放在 URL query 里，一次配置永久有效。
    本接口同时承担 CORS 预检（由 _cors_middleware 统一处理）。
    """
    if not _check_token(request):
        return web.json_response({"status": "error", "message": "unauthorized"}, status=403)

    _touch_worker(request)
    task = await pop_render_task()
    if not task:
        return web.json_response({"status": "ok", "task": None,
                                  "server_time": time.time()})

    # 把完整渲染 URL 也一并下发：worker 页拿到就能直接加载，无需自己拼参数，
    # 保证服务器对分辨率/码率/上传地址的改动能即时生效。
    task = dict(task)
    task["url"] = build_render_url(task["chart_id"], int(task["diff"]), task["request_id"])
    return web.json_response({"status": "ok", "task": task, "server_time": time.time()})


async def handle_api_report(request: web.Request) -> web.Response:
    """手机工作页汇报任务进度。

    支持 POST JSON：{"request_id": "...", "phase": "start|done|error", "error": "...", "bytes": n}
    也支持 GET 快捷形式：?request_id=..&phase=done

    主要用途：让服务器日志能立刻看出「手机已经开始编码这条任务了」，避免运营时
    只看到长时间静默。真正唤醒等待者仍由 /upload 落盘完成（文件才是唯一可信凭据）。
    """
    if not _check_token(request):
        return web.json_response({"status": "error", "message": "unauthorized"}, status=403)

    # 也算一次「工作页活着」的信号：编码期间 worker 忙于跑帧，轮询间隔会自然拉长，
    # 但 /api/report 一直在发，据此保持存活状态就不会误报离线。
    _touch_worker(request)

    payload: Dict[str, Any] = {}
    if request.method == "POST":
        try:
            body = await request.json()
            if isinstance(body, dict):
                payload = body
        except Exception:
            payload = dict(request.query)
    else:
        payload = dict(request.query)
    payload.pop("token", None)

    req_id = str(payload.get("request_id") or "")
    phase = str(payload.get("phase") or "")
    extra = {k: v for k, v in payload.items() if k not in ("request_id", "phase", "token")}

    logger.info(f"[PhoneBridge] 手机工作页汇报: req_id={req_id} phase={phase} "
                f"{json.dumps(extra, ensure_ascii=False)[:300]}")

    if phase in ("error", "failed") and req_id:
        # 编码失败也算这条任务有了结论：从租约里摘掉，避免过期后又被放回队列
        # 反复重试同一支必然失败的曲子。
        _finish_render_task(req_id)
        fut = _pending_requests.get(req_id)
        if fut and not fut.done():
            fut.set_result({"status": "render_failed",
                            "error": str(payload.get("error") or "手机端编码失败")})

    return web.json_response({"status": "ok", "request_id": req_id, "phase": phase})


async def handle_api_stored(request: web.Request) -> web.Response:
    """手机 Worker 把成品存进手机存储后，来这儿说一声。

    请求体只带元数据：chart_id / diff / name / path / size。**不带视频字节** ——
    视频已经在手机上了，服务器这里只是记一笔账、顺手唤醒等待结果的请求。

    为什么要单独一个端点而不是复用 /upload：/upload 会真的落盘 30-70 MB 并跑
    ffprobe 时长校验，本接口一个字节都不收。两者的语义完全不同，混在一起会让
    「手机存好了」和「服务器收到了」两件事分不清，而发群需要的是后者。

    谁会把这里叫醒：server/encoder-worker.js 存好手机文件后 POST 一次。
    """
    if not _check_token(request):
        return web.json_response({"status": "error", "message": "unauthorized"}, status=403)

    try:
        payload = await request.json()
    except Exception:
        payload = dict(request.query)
    if not isinstance(payload, dict):
        payload = {}

    chart_id = str(payload.get("chart_id") or request.query.get("chart_id") or "").strip()
    diff_raw = str(payload.get("diff") or request.query.get("diff") or "").strip()
    name = str(payload.get("name") or request.query.get("name") or "").strip()
    path = str(payload.get("path") or "").strip()
    try:
        size = int(payload.get("size") or 0)
    except (TypeError, ValueError):
        size = 0
    req_id = str(payload.get("request_id") or request.query.get("request_id") or "").strip()

    ids = _sanitize_upload_ids(chart_id, diff_raw)
    if not ids:
        return web.json_response(
            {"status": "error", "message": "invalid chart_id/diff",
             "chart_id": chart_id, "diff": diff_raw},
            status=422,
        )
    cid, diff_int = ids

    if not is_worker_alive() and not is_phone_online():
        logger.warning(f"[PhoneBridge] 收到「已存手机」通知但没有活跃节点: {cid}_{diff_int}")

    # 记账：手机上有这支了。批量预渲染靠这份索引跳过已完成的曲目。
    mark_archived(cid, diff_int, size)
    # 确认任务真的完成了：从租约表摘掉，别再被回收重做
    if req_id:
        _finish_render_task(req_id)
    else:
        _finish_render_task_by_ids(cid, diff_int)
    logger.info(f"[PhoneBridge] 手机已存好成品: {name or f'{cid}_{diff_int}.mp4'} "
                f"({size} B) @ {path or '手机存储'}")

    # 唤醒等待者。注意这里给的是 status=stored 而不是 success ——
    # 服务器手上还没有字节，调用方（request_render_on_phone）看到 stored 会
    # 再向 Agent 拉一趟，那一趟回来才是 success。
    wake_payload = {
        "status": "stored",
        "chart_id": cid,
        "diff": diff_int,
        "phone_path": path,
        "size": size,
    }
    woken = 0
    if req_id:
        fut = _pending_requests.get(req_id)
        if fut and not fut.done():
            fut.set_result(wake_payload)
            woken += 1
    if not woken:
        woken = _wake_pending_for(cid, diff_int, wake_payload)

    return web.json_response({
        "status": "ok",
        "chart_id": cid,
        "diff": diff_int,
        "size": size,
        "woken": woken,
    })


# ======================================================================
# 调试接口（联调用，都要求 token）
# ======================================================================
async def handle_debug_render(request: web.Request) -> web.Response:
    """命令手机现场渲染一次谱面并等回传，用于联调自检。

    注意渲染全曲要 1-2 分钟，timeout 不传就用 PHONE_RENDER_TIMEOUT_S（默认 900s）。
    """
    if not _check_token(request):
        return web.json_response({"status": "error", "message": "unauthorized"}, status=403)
    chart_id = request.query.get("chart_id", "").strip()
    diff_raw = request.query.get("diff", "").strip()
    if not chart_id:
        return web.json_response({"status": "error", "message": "chart_id required"}, status=400)
    diff = int(diff_raw) if diff_raw.isdigit() else None
    timeout = float(request.query.get("timeout", getattr(cfg, "PHONE_RENDER_TIMEOUT_S", 900)))
    ok, path, reason = await request_render_on_phone(chart_id, diff, timeout)
    # 兜底链接的难度要和主命令一致（取该曲最高槽位），不能用固定 5 ——
    # catalog 里最高槽位不是 5 的谱面有三百多条，写死会给出打不开的链接。
    link_diff = diff
    if link_diff is None and _alias_resolve is not None:
        try:
            link_diff = _alias_resolve.highest_slot(_alias_resolve.get_entry(chart_id))
        except Exception:
            link_diff = None
    return web.json_response({
        "ok": ok, "reason": reason, "file_path": path,
        "size": os.path.getsize(path) if path and os.path.isfile(path) else 0,
        "render_url": build_render_url(chart_id, link_diff or 5),
    })


async def handle_debug_request(request: web.Request) -> web.Response:
    """直接向手机节点发起一次视频调取并返回结果，用于联调自检。"""
    if not _check_token(request):
        return web.json_response({"status": "error", "message": "unauthorized"}, status=403)
    chart_id = request.query.get("chart_id", "").strip()
    diff_raw = request.query.get("diff", "").strip()
    if not chart_id:
        return web.json_response({"status": "error", "message": "chart_id required"}, status=400)
    diff = int(diff_raw) if diff_raw.isdigit() else None
    timeout = float(request.query.get("timeout", getattr(cfg, "PHONE_VIDEO_TIMEOUT_S", 60)))
    ok, path, reason = await request_video_from_phone(chart_id, diff, timeout)
    return web.json_response({
        "ok": ok, "reason": reason, "file_path": path,
        "size": os.path.getsize(path) if path and os.path.isfile(path) else 0,
    })


# ======================================================================
# CORS：让手机浏览器里的 Worker 能跨端口把视频 POST 到本桥
# ======================================================================
@web.middleware
async def _cors_middleware(request: web.Request, handler):
    """给所有响应补上跨域头，并直接应答 OPTIONS 预检。

    手机浏览器从 http://<host>:8777/ 下的编码 Worker 向 http://<host>:8778/upload
    上传视频，属于跨源请求（端口不同），必须先过预检，否则 fetch 直接抛
    "Failed to fetch"。注意 Worker 里发起的 fetch 同样走这套 CORS 规则，
    响应头是必须的，不能只靠同源判断放行。
    """
    origin = request.headers.get("Origin", "*")
    cors_headers = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Request-ID, X-Task-ID, X-Chart-ID, X-Diff",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
    }
    if request.method == "OPTIONS":
        return web.Response(status=204, headers=cors_headers)
    response = await handler(request)
    response.headers.update(cors_headers)
    return response


# ======================================================================
# 服务启动与生命周期
# ======================================================================
def make_app() -> web.Application:
    """构建 aiohttp 应用并挂上全部路由。

    路由表（改动任何一条都要同步手机端 worker.html / encoder-worker.js / phone_agent.py）：
      GET  /healthz        健康检查，不鉴权
      GET  /status         详细状态，要鉴权
      GET  /ws  /ws/phone  Termux Agent 的反向长连接
      POST /upload         手机上传成品视频（发群用，会跑完整性校验）
      POST /api/stored     手机存好成品后的通知（只带元数据，不收字节）
      GET  /video/<文件名>  手机反向拉取成品（仅备用，正常流程不再需要）
      GET  /api/task       工作页轮询领任务
      GET|POST /api/report 工作页汇报进度（同时兼作心跳）
      GET|POST /api/batch  批量预渲染（查进度 / 启动 / 停止）
      GET  /debug/*        联调用的手动触发接口
    """
    app = web.Application(
        client_max_size=200 * 1024 * 1024,   # 单次上传上限 200MB，足够装下最长曲目
        middlewares=[_cors_middleware],
    )
    app.router.add_get("/healthz", handle_healthz)
    app.router.add_get("/status", handle_status)
    app.router.add_get("/ws", handle_ws)
    app.router.add_get("/ws/phone", handle_ws)
    app.router.add_post("/upload", handle_upload)
    app.router.add_options("/upload", lambda r: web.Response(status=204))   # 预检由中间件应答
    # 手机存好成品后的通知：只收元数据，不收视频字节
    app.router.add_post("/api/stored", handle_api_stored)
    app.router.add_options("/api/stored", lambda r: web.Response(status=204))
    app.router.add_get("/video/{name}", handle_video_download)
    app.router.add_get("/api/task", handle_api_task)
    app.router.add_post("/api/report", handle_api_report)
    app.router.add_get("/api/report", handle_api_report)
    # 批量预渲染：POST 启动 / GET 查进度，都带 token
    app.router.add_get("/api/batch", handle_api_batch)
    app.router.add_post("/api/batch", handle_api_batch)
    app.router.add_get("/debug/request", handle_debug_request)
    app.router.add_get("/debug/render", handle_debug_render)
    return app


async def start_server(host: Optional[str] = None, port: Optional[int] = None) -> bool:
    """启动手机通信桥（异步非阻塞），已在跑则直接返回 True。

    端口被占用（errno 10048/98）不视为错误，而是当成「另一个实例已经在服务」直接复用 ——
    HoshinoBot 热重载或重复调 on_startup 时都会走到这个分支。
    """
    global _server_runner, _server_site, _is_running

    async with _server_lock:
        if _is_running and _server_site:
            return True

        h = host or getattr(cfg, "PHONE_BRIDGE_HOST", "0.0.0.0")
        p = port or getattr(cfg, "PHONE_BRIDGE_PORT", 8778)

        app = make_app()
        runner = web.AppRunner(app)
        await runner.setup()

        try:
            site = web.TCPSite(runner, h, p)
            await site.start()
            _server_runner = runner
            _server_site = site
            _is_running = True
            logger.info(f"[PhoneBridge] Phone Bridge 服务端已成功启动，监听于 {h}:{p}")
            # 启动后检查有没有上次被中断的批量任务，有就自己接上（后台跑，不阻塞启动）
            try:
                asyncio.get_running_loop().create_task(resume_batch_if_needed())
            except Exception as e:
                logger.warning(f"[PhoneBridge] 挂载批量续跑检查失败: {e}")
            return True
        except OSError as e:
            await runner.cleanup()
            if e.errno in (10048, 98):  # 地址/端口已被占用
                logger.info(f"Phone Bridge 端口 {p} 已在使用中（可能已有实例在跑），将复用")
                _is_running = True
                return True
            logger.error(f"启动 Phone Bridge 异常: {e}")
            raise


def ensure_bridge_running():
    """在已有事件循环里安全地触发一次启动（模块导入期调用的入口）。

    导入插件时通常还没有 running loop，此时 asyncio.get_running_loop() 抛 RuntimeError，
    静默跳过即可 —— 真正的启动交给 on_startup 钩子里的 await start_server()。
    """
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(start_server())
    except RuntimeError:
        pass


async def stop_server() -> None:
    """停止通信桥并清理资源（先关掉所有手机长连接，再拆站点）。"""
    global _server_runner, _server_site, _is_running
    async with _server_lock:
        for ws in list(_connected_clients):
            if not ws.closed:
                try:
                    await ws.close(code=1000, message=b"Server stopping")
                except Exception:
                    pass
        _connected_clients.clear()

        if _server_runner:
            try:
                await _server_runner.cleanup()
            except Exception:
                pass
        _server_runner = None
        _server_site = None
        _is_running = False
        logger.info("[PhoneBridge] Phone Bridge 服务端已安全停止。")


# 兼容旧调用名（早期联调脚本按这两个名字调用）
start_phone_bridge_server = start_server
stop_phone_bridge_server = stop_server


def is_running() -> bool:
    """查询通信桥是否处于运行中。"""
    return _is_running
