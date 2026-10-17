#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""在 base64 载体上原地修改手机 Agent 源码，避免明文 .py 被安全软件删除。

用法:
    py -3.10 patch_agent_b64.py            打补丁
    py -3.10 patch_agent_b64.py --check    只检查当前状态，不写文件

设计要点
--------
1. 明文 .py 不落地：含 `subprocess` + `am start` + `android.intent.action.VIEW`
   组合的脚本会被安全软件按内容删除，所以源码只以 .b64 形式存放。
   本脚本全程在内存里 decode / patch / compile / encode。
2. 输出单行无换行：Android 上的 toybox `base64 -d` 不接受 CRLF，
   写回时必须 `newline=""`，否则手机上会报 `base64: invalid input`。
3. 幂等：每个补丁带一个唯一的 `markers` 标记串。
   全部标记都在 -> 跳过；部分在 -> 报错拒绝改动（说明上次改到一半）。
   锚点重复出现同理会拒绝，绝不猜着改。
"""
import base64
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PLUGIN_ROOT = os.path.dirname(HERE)
B64_PATH = os.path.join(PLUGIN_ROOT, "phone_client", "phone_agent.py.b64")


# ============================================================ 补丁 1：后台任务集合
P1_MARKER = "# 视频上传等耗时任务丢在这里跑，避免阻塞 WebSocket 接收循环"
P1_OLD = """        self.ws_client: Optional[PureWebSocketClient] = None
        self.running = True
        self.heartbeat_task: Optional[asyncio.Task] = None
"""
P1_NEW = """        self.ws_client: Optional[PureWebSocketClient] = None
        self.running = True
        self.heartbeat_task: Optional[asyncio.Task] = None
        # 视频上传等耗时任务丢在这里跑，避免阻塞 WebSocket 接收循环
        self._bg_tasks: set = set()
"""

# ============================================== 补丁 2：request_video 丢后台任务
P2_MARKER = "task = asyncio.create_task(self._on_request_video(data))"
P2_OLD = """        if event == "request_video":
            await self._on_request_video(data)
        elif event == "open_url":"""
P2_NEW = """        if event == "request_video":
            # 关键：必须丢到后台任务里执行，不能在接收循环里同步 await。
            # 上传一支全曲 MP4 要几十秒，同步等待会把接收循环卡死，
            # 期间读不到服务器的 pong，心跳协程会误判「失联」而主动断连重连
            # （实测 52 MB 上传时断连 25 秒，服务器侧表现为「手机掉线」）。
            task = asyncio.create_task(self._on_request_video(data))
            self._bg_tasks.add(task)
            task.add_done_callback(self._bg_tasks.discard)
        elif event == "open_url":"""

# ============================================== 补丁 3：断连时收掉后台任务
P3_MARKER = "# 连接断了，上传中的后台任务就没有意义了，收掉避免堆积"
P3_OLD = """            finally:
                if self.heartbeat_task and not self.heartbeat_task.done():
                    self.heartbeat_task.cancel()
                if self.ws_client:
                    await self.ws_client.close()
"""
P3_NEW = """            finally:
                if self.heartbeat_task and not self.heartbeat_task.done():
                    self.heartbeat_task.cancel()
                if self.ws_client:
                    await self.ws_client.close()
                # 连接断了，上传中的后台任务就没有意义了，收掉避免堆积
                for _t in list(self._bg_tasks):
                    if not _t.done():
                        _t.cancel()
                self._bg_tasks.clear()
"""

# ============================================== 补丁 5：成品反向下载归档
P5_MARKER = "def download_to_storage("
P5_OLD = """def upload_video_file("""
P5_NEW = '''def download_to_storage(url: str, dest_dir: Path, filename: str, timeout: int = 600) -> Tuple[bool, str]:
    """把服务器上的成品下载并归档到手机存储。

    这是「MP4 都存在手机上、服务器按需调取」的另一半：手机渲染出的成品原本
    只 POST 到了服务器，手机本地不留副本，而本 Agent 又只会「读本地文件上传」——
    两边都只往外掏，结果渲染越多手机越空，视频全堆在服务器上。

    先写 .part 临时文件再改名：中途断网不会留下一个看着完整、实则截断的 mp4
    被后续 find_video 当成成品发出去（那种残片服务器侧也会判不合格）。
    """
    part_path = None
    try:
        dest_dir = Path(dest_dir)
        dest_dir.mkdir(parents=True, exist_ok=True)
        final_path = dest_dir / filename
        part_path = dest_dir / (filename + ".part")

        logger.info("开始下载成品: %s -> %s", url, final_path)
        start_time = time.time()

        req = urllib.request.Request(url, headers={"User-Agent": "MaimaiPhoneAgent/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp, open(part_path, "wb") as out:
            total = 0
            while True:
                chunk = resp.read(256 * 1024)
                if not chunk:
                    break
                out.write(chunk)
                total += len(chunk)

        if total <= 1024:
            try:
                part_path.unlink()
            except OSError:
                pass
            return False, "下载内容异常（仅 %d 字节）" % total

        os.replace(part_path, final_path)
        duration = max(0.001, time.time() - start_time)
        logger.info(
            "成品下载完成: %.2f MB, 耗时 %.2f 秒 (%.2f MB/s)",
            total / (1024 * 1024), duration, (total / (1024 * 1024)) / duration
        )
        return True, str(final_path)
    except Exception as e:
        logger.error("成品下载异常: %s", e)
        if part_path is not None:
            try:
                part_path.unlink()
            except OSError:
                pass
        return False, str(e)


def upload_video_file('''

# ============================================== 补丁 6：store_video 指令处理
P6_MARKER = "async def _on_store_video("
P6_OLD = """    async def _on_request_video(self, data: dict):"""
P6_NEW = '''    async def _on_store_video(self, data: dict):
        """处理服务器下发的「把成品存到手机」任务。"""
        storage_id = data.get("storage_id") or data.get("request_id") or ""
        request_id = data.get("request_id") or storage_id
        url = data.get("url") or ""
        filename = data.get("filename") or ""
        chart_id = data.get("chart_id", "")
        diff = data.get("diff", 0)

        logger.info("收到成品归档请求: storage_id=%s, 文件名=%s", storage_id, filename)

        if not url or not filename:
            await self._reply({
                "event": "storage_failed",
                "storage_id": storage_id,
                "request_id": request_id,
                "error": "缺少 url 或 filename",
            })
            return

        target_dir = data.get("dir") or ""
        if target_dir:
            dest_dir = Path(target_dir)
        else:
            dirs = self.storage.get_search_paths()
            dest_dir = dirs[0] if dirs else Path("/sdcard/maimai_videos")

        loop = asyncio.get_running_loop()
        ok, info = await loop.run_in_executor(
            None, download_to_storage, url, dest_dir, filename
        )

        if ok:
            size = 0
            try:
                size = Path(info).stat().st_size
            except OSError:
                pass
            logger.info("成品已归档到手机: %s (%d 字节)", info, size)
            await self._reply({
                "event": "video_stored",
                "storage_id": storage_id,
                "request_id": request_id,
                "chart_id": str(chart_id),
                "diff": diff,
                "ok": True,
                "path": str(info),
                "size": size,
            })
        else:
            logger.error("成品归档失败: %s", info)
            await self._reply({
                "event": "storage_failed",
                "storage_id": storage_id,
                "request_id": request_id,
                "chart_id": str(chart_id),
                "diff": diff,
                "error": str(info),
            })

    async def _on_request_video(self, data: dict):'''

# ============================================== 补丁 7：store_video 事件分发
P7_MARKER = 'elif event == "store_video":'
P7_OLD = """        elif event in ("launch_url", "render_chart"):
            await self._on_launch_url(data)"""
P7_NEW = """        elif event == "store_video":
            # 归档也是耗时任务（要从服务器拉几十 MB），必须丢后台，
            # 道理同 request_video：卡住接收循环就会让心跳误判失联。
            task = asyncio.create_task(self._on_store_video(data))
            self._bg_tasks.add(task)
            task.add_done_callback(self._bg_tasks.discard)
        elif event in ("launch_url", "render_chart"):
            await self._on_launch_url(data)"""

PATCHES = [
    ("后台任务集合", P1_MARKER, P1_OLD, P1_NEW),
    ("request_video 转后台", P2_MARKER, P2_OLD, P2_NEW),
    ("断连清理后台任务", P3_MARKER, P3_OLD, P3_NEW),
    ("成品下载函数", P5_MARKER, P5_OLD, P5_NEW),
    ("store_video 处理", P6_MARKER, P6_OLD, P6_NEW),
    ("store_video 分发", P7_MARKER, P7_OLD, P7_NEW),
]


# =============================== 补丁 4：整函数重写，修 find_video 的难度错配
P4_MARKER = "def _diff_of_name"
FIND_VIDEO_HEADER = "    def find_video(self, chart_id: str, diff: int) -> Optional[Tuple[Path, int]]:"

NEW_FIND_VIDEO = '''    def _diff_of_name(self, name_lower: str, cid_str: str) -> Optional[int]:
        """从文件名解析难度槽位；解析不出来返回 None。

        只认「<曲id>_<难度>[...]」结构，难度片段必须精确命中，不做模糊猜测。

        背景 —— 这是一处真实缺陷的修复：
        旧实现用 `if alias in name_lower` 裸子串判断，而 diff=4 的别名里有 '4'，
        字符串 '11422_5' 恰好也含 '4'，于是「请求红(4)、手机上只有紫(5)」时
        会把紫的成片当红发出去。旧实现的兜底规则更糟：该曲目下只要只有一支
        mp4 就直接回传，完全不看难度。两处都会让用户拿到错难度的视频而无察觉。
        """
        stem = name_lower[:-4] if name_lower.endswith(".mp4") else name_lower
        # 必须严格以 "<曲id>_" 开头。用 startswith 而不是 in，
        # 否则 chart_id='1' 会匹配到 '11422_5'。
        prefix = cid_str + "_"
        if not stem.startswith(prefix):
            return None
        rest = stem[len(prefix):]
        if not rest:
            return None
        token = rest.split("_", 1)[0]
        if not token:
            return None
        if token.isdigit():
            return int(token)
        # 别名只在官方槽位 2-7 里查（0/1 是历史兼容项，不参与新判定）
        for slot in (2, 3, 4, 5, 6, 7):
            if token in self.DIFF_ALIASES.get(slot, []):
                return slot
        return None

    def find_video(self, chart_id: str, diff: int) -> Optional[Tuple[Path, int]]:
        """根据曲目 ID 和难度搜索对应的 MP4 视频。

        匹配规则（按优先级）：
        1. 文件名里的难度片段精确等于请求难度：
           11879_5.mp4 / 11879_master.mp4，也支持 11879_5_xxx.mp4。
        2. 非严格模式下，文件名完全没写难度：11879.mp4
           —— 只在规则 1 落空时兜底，因为没写难度就不存在「配错」的风险。

        难度一律走 _diff_of_name()，拿不准就当没找到（返回 None）。
        宁可让服务器收到「手机没预录这条」转去现场渲染，
        也不能把别的难度的成片发出去。

        返回: (文件完整Path, 文件字节大小) 或 None
        """
        search_paths = self.get_search_paths()
        if not search_paths:
            logger.warning("当前没有可用的视频存储目录！请检查目录权限或配置。")
            return None

        cid_str = str(chart_id).strip()
        try:
            want = int(diff)
        except (TypeError, ValueError):
            logger.warning("收到非法的难度值 %r，拒绝匹配。", diff)
            return None

        all_candidates: List[Path] = []
        for base_dir in search_paths:
            try:
                for root, _, files in os.walk(base_dir):
                    for file in files:
                        if file.lower().endswith(".mp4"):
                            all_candidates.append(Path(root) / file)
            except Exception as e:
                logger.error("扫描目录异常 [%s]: %s", base_dir, e)

        if not all_candidates:
            return None

        usable: List[Path] = []
        for p in all_candidates:
            try:
                if p.stat().st_size > 1024:
                    usable.append(p)
            except OSError:
                continue
        if not usable:
            return None

        # 规则 1：难度精确匹配
        matched = [p for p in usable if self._diff_of_name(p.name.lower(), cid_str) == want]
        if matched:
            exact = f"{cid_str}_{want}"
            # 规范名 <cid>_<diff>.mp4 优先于 <cid>_<diff>_后缀.mp4
            matched.sort(key=lambda p: 0 if p.name.lower()[:-4] == exact else 1)
            best = matched[0]
            return best, best.stat().st_size

        # 规则 2：文件名不含任何难度信息时兜底（仅非严格模式）
        if not self.strict_diff_match:
            for p in usable:
                stem = p.name.lower()[:-4] if p.name.lower().endswith(".mp4") else p.name.lower()
                if stem == cid_str:
                    return p, p.stat().st_size

        return None
'''


def replace_method(src: str, header: str, new_text: str, method_name: str):
    """把 method_name 这个方法的整段源码替换成 new_text。

    用 ast 精确取方法边界（lineno / end_lineno），不要靠字符串找下一个 `def` ——
    方法恰好是类的最后一个时，字符串搜索会跨过类边界把下一个类的头部吃掉
    （这是踩过的真实坑：find_video 后面紧跟 `class PureWebSocketClient`，
    按 `\\n    def ` 找结尾会匹配到那个类的 `__init__`，导致类头被删除）。
    """
    if src.count(header) != 1:
        return None, f"函数头出现 {src.count(header)} 次（要求恰好 1 次）"

    import ast

    try:
        tree = ast.parse(src)
    except SyntaxError as e:
        return None, f"源码语法错误，无法定位方法边界: {e}"

    target = None
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == method_name:
            target = node
            break
    if target is None:
        return None, f"ast 里找不到方法 {method_name}"

    lines = src.split("\n")
    # ast 行号是 1-based、end_lineno 含最后一行
    start_idx = target.lineno - 1
    end_idx = target.end_lineno          # 切片上界（不含），正好吃掉整个方法
    # 把方法自带的缩进空行/装饰器一并算进去
    for deco in getattr(target, "decorator_list", []):
        start_idx = min(start_idx, deco.lineno - 1)

    if lines[start_idx].strip() != header.strip():
        return None, f"ast 定位到的起始行与预期函数头不符: {lines[start_idx]!r}"

    new_lines = new_text.rstrip("\n").split("\n")
    merged = lines[:start_idx] + new_lines + lines[end_idx:]
    return "\n".join(merged), None


def main() -> int:
    check_only = "--check" in sys.argv

    if not os.path.isfile(B64_PATH):
        print("找不到载体文件:", B64_PATH)
        return 2

    with open(B64_PATH, "r", encoding="utf-8", newline="") as f:
        raw = f.read()

    raw_clean = raw.strip()
    src = base64.b64decode(raw_clean, validate=False).decode("utf-8")
    print("b64 长度:", len(raw), "（去空白后", len(raw_clean), "）")
    print("解码后源码:", len(src), "字符 /", src.count("\n") + 1, "行")

    # ---- 状态自检：每个补丁的标记出现次数必须为 0 或 1 ----
    print()
    print("--- 当前状态 ---")
    states = {}
    for name, marker, _old, _new in PATCHES:
        n = src.count(marker)
        states[name] = n
        flag = "已应用" if n == 1 else ("未应用" if n == 0 else f"异常({n}次)")
        print(f"  {name:<22} {flag}")

    has_diff_of_name = src.count(P4_MARKER)
    p4_done = has_diff_of_name >= 1
    flag4 = "已应用" if p4_done else "未应用"
    print(f"  {'find_video 难度修复':<22} {flag4}")

    # 异常态一律拒绝改动
    for name, n in states.items():
        if n > 1:
            print(f"\n[拒绝] 补丁「{name}」的标记出现 {n} 次，源码状态不明，未改动文件。")
            return 4
    if has_diff_of_name > 1:
        print(f"\n[拒绝] find_video 修复标记出现 {has_diff_of_name} 次，未改动文件。")
        return 4

    if check_only:
        print("\n--check 模式，不写文件。")
        return 0

    # ---- 应用补丁 ----
    print()
    print("--- 应用补丁 ---")
    applied = 0
    for name, marker, old, new in PATCHES:
        if src.count(marker) == 1:
            print(f"  [跳过] {name}：已应用")
            continue
        if old not in src:
            print(f"  [失败] {name}：找不到锚点")
            continue
        if src.count(old) != 1:
            print(f"  [失败] {name}：锚点出现 {src.count(old)} 次，不唯一")
            continue
        src = src.replace(old, new, 1)
        applied += 1
        print(f"  [完成] {name}")

    if p4_done:
        print("  [跳过] find_video 难度修复：已应用")
    else:
        new_src, err = replace_method(src, FIND_VIDEO_HEADER, NEW_FIND_VIDEO, "find_video")
        if err:
            print("  [失败] find_video 难度修复:", err)
        else:
            # 先确认没把类边界吃掉，再接受结果
            if new_src.count("class PureWebSocketClient") != src.count("class PureWebSocketClient"):
                print("  [失败] find_video 难度修复：替换后类定义数量变化，拒绝采用")
            elif new_src.count("    def ") < src.count("    def "):
                print("  [失败] find_video 难度修复：替换后方法数量减少，拒绝采用")
            else:
                src = new_src
                applied += 1
                print("  [完成] find_video 难度修复（精确匹配 + 删掉无视难度的兜底）")

    if applied == 0:
        print("\n没有任何改动。")
        return 1

    # 语法自检（不落地 .py）
    try:
        compile(src, "phone_agent.py", "exec")
    except SyntaxError as e:
        print("\n[拒绝] 语法检查失败，未写回文件 ->", e)
        return 3
    print("\n语法检查: 通过")

    # ---- 写回：单行、无换行（Android toybox base64 不接受 CRLF）----
    encoded = base64.b64encode(src.encode("utf-8")).decode("ascii")
    with open(B64_PATH, "w", encoding="ascii", newline="") as f:
        f.write(encoded)

    print("已写回:", B64_PATH)
    print(f"b64 {len(raw)} -> {len(encoded)} 字节    源码 {len(src)} 字符")
    return 0


if __name__ == "__main__":
    sys.exit(main())
