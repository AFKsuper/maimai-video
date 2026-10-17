# -*- coding: utf-8 -*-
"""mai_preview 的难度解析核心。

职责只有一件：把用户写的难度（「紫」「master」「5」）翻译成 simai 的槽位数字。

历史说明：这里原有两个函数用来在服务器上拉起静态渲染服务（serve.py，8777），
后来服务器搬到了云上、手机与服务器不再同局域网，adb reverse 那条中转路走不通了。
于是渲染器整个搬到手机磁盘上，由手机自己的 Termux 跑 render_server.py 提供，
服务器不再托管任何静态文件——这两个函数随之删除。

设计约束：
- 本模块不 import hoshino / nonebot，可脱离 bot 直接运行；
- 全部为无副作用的函数定义（nonebot load_plugins 也会 import 本文件）；
- 本模块**不含任何渲染逻辑**。手机端 MP4 由手机浏览器里的 Web Worker
  （worker.html 派发 + encoder-worker.js + WebCodecs）逐帧编码，详见
  phone_bridge.py 与 手机渲染部署指南.md。

对外使用方：mai_preview.py（core.parse_diff / core.PreviewError）。
"""
from __future__ import annotations


class PreviewError(Exception):
    """面向用户的可读错误（message 会直接发到群里）。"""


# ---------------------------------------------------------------- 参数解析

# 难度别名 -> 谱面槽位（&lv_N / &inote_N 的 N，见 maidata 原文）：
#   2=Basic(绿) 3=Advanced(黄) 4=Expert(红) 5=Master(紫) 6=Re:Master(白) 7=宴/Utage
#
# 数字怎么读（群里的习惯写法）：
#   1 2 3 4 5 = 绿 黄 红 紫 白（第几档难度，从上往下数）
#   6 = 白、7 = 宴 保留为旧槽位直通，老用户写惯了不会被打破；
#   纯数字落在 1-5 之外的，原样透传给手机端（那边会报可用列表）。
DIFF_ALIASES = {
    "1": 2, "绿": 2, "简单": 2, "basic": 2,
    "2": 3, "黄": 3, "普通": 3, "进阶": 3, "advanced": 3,
    "3": 4, "红": 4, "困难": 4, "expert": 4,
    "4": 5, "紫": 5, "大师": 5, "master": 5,
    "5": 6, "白": 6, "re": 6, "rem": 6, "remaster": 6, "re:master": 6,
    "7": 7, "宴": 7, "utage": 7, "双押": 7,
}

DIFF_HINT = "1=绿 2=黄 3=红 4=紫 5=白，宴写「宴」"


def parse_diff(token: str) -> int:
    """难度别名 / 档位数字 -> 槽位整数；无法识别抛 PreviewError。"""
    if not isinstance(token, str):
        raise PreviewError(
            f"难度必须是文字或数字，收到的是 {type(token).__name__}。可用：{DIFF_HINT}。"
        )
    key = token.strip().lower()
    if key in DIFF_ALIASES:
        return DIFF_ALIASES[key]
    if token.strip().isdigit():
        return int(token.strip())
    raise PreviewError(
        f"无法识别的难度「{token}」。可用：{DIFF_HINT}。"
    )
