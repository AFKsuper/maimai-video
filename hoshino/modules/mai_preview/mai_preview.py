# -*- coding: utf-8 -*-
"""mai_preview —— QQ 群「谱面确认」命令。

命令面只有一条：
  谱面确认 <曲id或别名> [难度]

服务器不出图不渲染，视频由手机节点编码（60fps MP4）：
  ① 先查服务器本地缓存，命中直接发；
  ② 没缓存就向手机要预录成品；
  ③ 还没有就排入渲染队列，由手机 Chrome 工作页现场编码回传。

谱面数据来自「ADX 谱面资源」https://adxdls.saop.cc （CC BY 4.0）
"""
from __future__ import annotations

import base64
import os
from typing import Optional, Tuple

from nonebot import NoneBot

from hoshino import priv
from hoshino.service import Service
from hoshino.typing import CQEvent, MessageSegment

try:
    from . import config as cfg
    from . import render_core as core
    from . import alias_resolve as ar
    from . import phone_bridge as pb
except ImportError:  # 兼容极端加载方式
    import config as cfg
    import render_core as core
    import alias_resolve as ar
    import phone_bridge as pb

# 模块加载时安全拉起手机通信网关
pb.ensure_bridge_running()


# bot 启动后拉起常驻服务：手机通信网关（8778）。
# 渲染器与落盘服务都在手机自己身上（phone_client/render_server.py），
# 服务器这边只剩这一个必须常驻的端口，所以放在 on_startup 里而不是等首个命令。
try:
    from nonebot import on_startup
except ImportError:  # 兼容极端加载方式
    on_startup = None

if on_startup is not None:
    @on_startup
    async def _mai_preview_startup():
        try:
            ok = await pb.start_server()
            sv.logger.info(f"mai_preview 手机通信网关启动: {ok}")
        except Exception:
            sv.logger.exception("mai_preview 手机通信网关启动失败")

sv_help = """谱面确认：查谱面，调 60fps 原视频

用法
  谱面确认 <曲id或别名> [难度]
  例：谱面确认 11879 紫

难度
  绿 BASIC / 黄 ADVANCED / 红 EXPERT / 紫 MASTER / 白 Re:MASTER / 宴
  也可以直接写数字 2-7；不写难度就取该曲最高难度。
  曲id 可以换成 maimaiDX 别名库里的名字。

流程
  服务器有缓存，秒发；没有就向手机调预录成品；
  都没有则由手机工作页现场编码，约 1-2 分钟，期间别锁屏。"""

sv = Service(
    "mai_preview", manage_priv=priv.ADMIN, enable_on_default=True, help_=sv_help,
)

CREDIT = "谱面数据来自「ADX 谱面资源」https://adxdls.saop.cc （CC BY 4.0）"


def _credit(chart_id: Optional[str] = None) -> str:
    """署名行；给了曲 id 就指向该谱的在线预览页。"""
    if chart_id:
        return (f"谱面数据来自「ADX 谱面资源」"
                f"https://adxdls.saop.cc/charts/{chart_id}?preview=1 （CC BY 4.0）")
    return CREDIT

confirm_cmd = sv.on_prefix(["谱面确认"])
help_cmd = sv.on_fullmatch(["帮助mai_preview"])

_USAGE = "用法：谱面确认 <曲id或别名> [难度]，例：谱面确认 11879 紫"


def _parse_args(text: str, usage: str,
                ) -> Tuple[str, Optional[dict], Optional[int]]:
    """解析 <id或别名> [难度]；参数不合法抛 PreviewError。

    返回 (chart_id, catalog_entry|None, diff|None)。
    """
    parts = text.strip().split()
    if not parts:
        raise core.PreviewError(usage)
    chart_id, entry = ar.resolve_chart(parts[0])   # 纯数字直通 / 别名桥接
    diff: Optional[int] = None
    if len(parts) >= 2:
        diff = core.parse_diff(parts[1])
    ar.ensure_difficulty(entry, diff)              # 目录提前校验，错误更可读
    return chart_id, entry, diff


def _confirm_line(chart_id: str, entry: Optional[dict],
                  diff: Optional[int], note: bool = True) -> str:
    """《曲名》 · 曲id 11879 · 紫 MASTER Lv.14.9（缺省取最高时注明）。"""
    if diff is None and entry:
        diff = ar.highest_slot(entry)
        note_txt = "（没写难度，取的最高）" if note else ""
    else:
        note_txt = ""
    if entry:
        head = f"《{entry.get('title', '?')}》 · 曲id {chart_id}"
    else:
        head = f"曲 {chart_id}"
    if diff is not None:
        head += " · " + (ar.describe_difficulty(entry, diff) or f"难度 {diff}")
    return head + note_txt


def _available_diffs(entry: Optional[dict]) -> str:
    opts = ar.difficulty_options(entry)
    if not opts:
        return ""
    return "可用：" + " ".join(
        f"{ar.SLOT_COLOR.get(s, '')}{name}({level})"
        for s, name, level in opts
    )


async def _send_cached_video(bot: NoneBot, ev: CQEvent, video_path: str,
                             confirm: str, chart_id: str, cache_hit: bool = False):
    """发 MP4 到群：先 file URI，失败换 base64，再失败发文字+本地路径。"""
    abs_path = os.path.abspath(video_path)
    file_uri = f"file:///{abs_path.replace(os.sep, '/')}"
    hit_tag = ("服务器缓存命中，直接发成品。" if cache_hit
               else "手机节点 60fps 编码完成。")
    caption = f"\n{confirm}\n{hit_tag}\n{_credit(chart_id)}"

    try:
        await bot.send(ev, MessageSegment.video(file_uri) + MessageSegment.text(caption))
    except Exception:
        try:
            with open(abs_path, "rb") as vf:
                vdata = vf.read()
            b64_str = "base64://" + base64.b64encode(vdata).decode()
            await bot.send(ev, MessageSegment.video(b64_str) + MessageSegment.text(caption))
        except Exception:
            sv.logger.exception("mai_preview 视频发送失败")
            await bot.send(
                ev,
                f"视频没发出去（协议端可能不支持直发视频）。\n"
                f"{confirm}\n本地文件：{abs_path}"
            )


@confirm_cmd
async def confirm_handler(bot: NoneBot, ev: CQEvent):
    args = ev.message.extract_plain_text().strip()
    try:
        # 兼容用户输入里带「原视频」「视频」「mp4」这类词缀
        tokens = [tok for tok in args.split() if tok not in ("原视频", "视频", "mp4", "MP4")]
        chart_id, entry, diff = _parse_args(" ".join(tokens), _USAGE)

        resolved_diff = diff if diff is not None else (
            ar.highest_slot(entry) if entry else None)
        confirm = _confirm_line(chart_id, entry, diff)

        # 1. 难度定不下来就没法继续：产物没法命名，也没法校验时长。
        if resolved_diff is None:
            await bot.send(
                ev,
                f"曲 {chart_id} 没有难度信息，这单做不了。\n"
                f"{_available_diffs(entry)}"
            )
            return

        # 2. 服务器本地缓存有成品就直接发
        cached_path = pb.get_cached_mp4(chart_id, resolved_diff)
        if cached_path:
            await _send_cached_video(bot, ev, cached_path, confirm, chart_id, cache_hit=True)
            return

        # 3. 没缓存：拉起通信服务，看手机侧谁能干活
        await pb.start_server()

        phone_online = pb.is_phone_online()      # Termux Agent 在线（能回传预录视频）
        worker_alive = pb.is_worker_alive()      # 浏览器工作页在轮询（能现场渲染）

        if not phone_online and not worker_alive:
            await bot.send(
                ev,
                "手机节点还没上线，两步启动：\n"
                f"1. 手机 Chrome 打开工作页（打开一次就行，之后可以切后台）：{pb.worker_page_url()}\n"
                "2. 或在 Termux 跑起 agent 脚本，回传手机上已预录的视频"
            )
            return

        # 4. Termux Agent 在线，先要预录成品（预录命中是秒回的）
        reason = "not_found"
        if phone_online:
            await bot.send(ev, "服务器没有缓存，正在向手机调预录视频…")
            # 超时不能用小数值：一支全曲 60fps MP4 有 30-70 MB，
            # 手机走 WiFi 回传实测约 1.2 MB/s，52 MB 要 40 秒以上。
            # 这里必须给足时间，否则会出现「手机传完了、服务器早就放弃」的错判。
            success, video_path, reason = await pb.request_video_from_phone(
                chart_id, resolved_diff, timeout=getattr(cfg, "PHONE_VIDEO_TIMEOUT_S", 180)
            )
            if success and video_path:
                await _send_cached_video(bot, ev, video_path, confirm, chart_id, cache_hit=False)
                return

        # 5. 手机没预录：排入渲染队列，由手机工作页现场编码回传
        #    render_failed = 手机确实传回了文件，但守门判定不合格（时长/归属对不上），
        #    这和「没预录」一样应该转到现场渲染，而不是直接报错给用户。
        if reason in ("not_found", "timeout", "render_failed") and getattr(cfg, "PHONE_RENDER_ENABLED", True):
            if not worker_alive:
                await bot.send(
                    ev,
                    "手机没有这条的预录视频，也检测不到渲染工作页在跑。\n"
                    "在手机 Chrome 打开这个页面（打开一次就行，之后可以切后台）就会自动接活：\n"
                    f"{pb.worker_page_url()}"
                )
                return

            await bot.send(
                ev,
                "手机没预录这条，转现场渲染：由手机工作页现场编码 60fps 原视频，"
                "约 1-2 分钟。编码跑在后台 Worker 里，手机可以锁屏或切到别的应用。"
            )
            # 渲染器与落盘服务都在手机自己身上（phone_client/render_server.py），
            # 服务器这边没有需要预先拉起的静态服务，直接把任务排进队列即可。
            render_timeout = float(getattr(cfg, "PHONE_RENDER_TIMEOUT_S", 900))
            ok2, path2, reason2 = await pb.request_render_on_phone(
                chart_id, resolved_diff, timeout=render_timeout
            )
            if ok2 and path2:
                await _send_cached_video(bot, ev, path2, confirm, chart_id, cache_hit=False)
                return
            if reason2 == "timeout":
                await bot.send(ev, "手机渲染超时。看一眼工作页上的任务日志，然后重试一次。")
            elif reason2 == "offline":
                await bot.send(ev, "手机渲染到一半掉线，检查工作页和网络后重试。")
            elif reason2 == "render_failed":
                await bot.send(ev, "手机端编码失败，看一眼工作页上的任务日志。")
            else:
                await bot.send(ev, f"手机渲染失败（{reason2}），稍后再试。")
            return

        # 6. 预录没要到、现场渲染也没开
        if reason == "offline":
            await bot.send(ev, "调取过程中手机 agent 掉线了，检查 Termux 脚本是否还活着。")
        elif reason == "render_failed":
            await bot.send(
                ev,
                "手机回传的视频没通过完整性校验，已丢弃。\n"
                "多半是录制中途被打断，重录一条再试；服务器也会转去现场渲染。"
            )
        elif reason == "error":
            await bot.send(ev, "向手机调取预录视频时出错，稍后再试。")
        else:
            await bot.send(ev, f"预录视频没调到（{reason}），稍后再试。")
        return

    except core.PreviewError as e:
        await bot.send(ev, f"谱面确认失败：{e}")
    except Exception:
        sv.logger.exception("mai_preview 谱面确认处理出错")
        await bot.send(ev, "谱面确认出错了，已记日志，稍后再试。")


@help_cmd
async def _(bot: NoneBot, ev: CQEvent):
    await bot.send(ev, sv_help + "\n" + _credit())
