# -*- coding: utf-8 -*-
"""把渲染服务与谱面数据打包进 mai_preview 插件（自包含部署用）。

产物（均在插件目录内，部署时只拷贝整个 modules 即可）：
    server/serve.py            渲染服务（已打补丁：id→曲名映射 + 插件内 data 根）
    server/render.html         渲染页
    server/render-bundle.js    渲染 bundle
    data/catalog.json          ADX 谱面目录（别名桥接 / 难度校验用）
    data/<曲名>/maidata.txt    每曲一个文件夹，放该曲数据包
    data/id2dir.json           short_id -> 曲名文件夹 映射（serve.py 路由用）

用法：
    python import_data.py                     # 默认从 Z:\\Hoshino\\adx-dl 拉取
    python import_data.py --adxcs X --catalog Y --server-src Z

曲名清洗：替换 Windows 非法字符 \\ / : * ? " < > | 与控制字符，去尾部点/空格；
撞名（88 个重复曲名）追加 __<short_id> 后缀；保留名（CON 等）加前缀 _。
重复执行为覆盖更新（同名文件覆盖，不会产生重复文件夹）。
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))       # tools/
PLUGIN = os.path.dirname(HERE)                          # mai_preview/
DATA = os.path.join(PLUGIN, "data")
SERVER = os.path.join(PLUGIN, "server")

DEFAULT_ADXCS = r"Z:\Hoshino\adx-dl\apps\web\public\adxcs"
DEFAULT_CATALOG = r"Z:\Hoshino\adx-dl\data\catalog\index.json"
DEFAULT_SERVER_SRC = r"Z:\Hoshino\preview-demo"

RESERVED = {"CON", "PRN", "AUX", "NUL",
            "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
            "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"}


def safe_name(title: str) -> str:
    """曲名 -> 合法 Windows 文件夹名。"""
    t = re.sub(r'[\\/:*?"<>|\x00-\x1f]', "_", title)
    t = t.strip().rstrip(". ")
    if not t:
        t = "_"
    if t.split(".")[0].upper() in RESERVED:
        t = "_" + t
    return t


def main(argv=None) -> int:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    ap = argparse.ArgumentParser(description="打包谱面数据到 mai_preview 插件")
    ap.add_argument("--adxcs", default=DEFAULT_ADXCS, help="谱面根（short_id 目录）")
    ap.add_argument("--catalog", default=DEFAULT_CATALOG, help="目录 index.json")
    ap.add_argument("--server-src", default=DEFAULT_SERVER_SRC, help="渲染服务源目录")
    ap.add_argument("--skip-data", action="store_true", help="只拷服务文件，不拷数据")
    args = ap.parse_args(argv)

    # ---------- 1) 渲染服务 ----------
    os.makedirs(SERVER, exist_ok=True)
    for name in ("render.html", "render-bundle.js"):
        src = os.path.join(args.server_src, name)
        if not os.path.isfile(src):
            print(f"FAIL 源文件缺失: {src}")
            return 1
        shutil.copy2(src, os.path.join(SERVER, name))
        print(f"  server/{name} <- {src}")
    src_serve = os.path.join(args.server_src, "serve.py")
    dst_serve = os.path.join(SERVER, "serve.py")
    if not os.path.isfile(dst_serve) and os.path.isfile(src_serve):
        shutil.copy2(src_serve, dst_serve)   # 仅首次拷贝；之后以插件内补丁版为准
        print("  server/serve.py <- 首次拷贝（插件内版本为补丁版，重跑不覆盖）")

    if args.skip_data:
        print("SKIP 数据拷贝（--skip-data）")
        return 0

    # ---------- 2) 目录 ----------
    if not os.path.isfile(args.catalog):
        print(f"FAIL 目录缺失: {args.catalog}")
        return 1
    os.makedirs(DATA, exist_ok=True)
    shutil.copy2(args.catalog, os.path.join(DATA, "catalog.json"))
    with open(args.catalog, encoding="utf-8") as fh:
        entries = json.load(fh).get("entries", [])
    print(f"  data/catalog.json <- {args.catalog}（{len(entries)} 曲）")

    # ---------- 3) 每曲数据包 ----------
    id2dir: dict[str, str] = {}
    used: set[str] = set()
    copied = missing = 0
    collisions: list[tuple[str, str]] = []
    total = 0
    for e in entries:
        sid = str(e.get("short_id", ""))
        if not sid:
            continue
        src = os.path.join(args.adxcs, sid, "maidata.txt")
        if not os.path.isfile(src):
            missing += 1
            continue
        # Windows 文件系统大小写不敏感：查重必须 casefold
        base = safe_name(str(e.get("title", "")))
        cand = f"{base}__{sid}"
        name = base
        i = 1
        while name.casefold() in used:
            name = cand if i == 1 else f"{cand}_{i}"
            i += 1
        if name != base:
            collisions.append((str(e.get("title", "")), name))
        used.add(name.casefold())
        dst_dir = os.path.join(DATA, name)
        os.makedirs(dst_dir, exist_ok=True)
        dst = os.path.join(dst_dir, "maidata.txt")
        shutil.copy2(src, dst)
        total += os.path.getsize(dst)
        id2dir[sid] = name
        copied += 1

    with open(os.path.join(DATA, "id2dir.json"), "w", encoding="utf-8") as fh:
        json.dump(id2dir, fh, ensure_ascii=False, indent=0)
    print(f"  数据包: {copied} 曲拷贝 / {missing} 缺源 / 撞名改名 {len(collisions)}")
    for t, n in collisions[:5]:
        print(f"    撞名: 《{t}》 -> {n}")
    print(f"  data/ 总计 {total / 1024 / 1024:.1f} MB, id2dir.json {len(id2dir)} 条")
    print("IMPORT DONE")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
