#!/system/bin/sh
# start_render.sh —— 在手机 Termux 里启动渲染服务（渲染页 8777 + 落盘 8780）
#
# 为什么用 /system/bin/sh 而不是 bash：这台手机的 Termux bash 已损坏
# （`pwd: cannot execute binary file`），也没装 which/pgrep/pkill，
# 所以全部用 POSIX sh + 手动 PATH + ps/awk 代替 pgrep/pkill。
#
# 为什么所有东西都放在 /sdcard 下：Termux 家目录对 adb shell 不可见、重装
# Termux 会清空，而 /sdcard 上放着一份就能直接跑，省掉「复制到家目录」这一步。
#
# 用法（Termux 里）：
#     sh /sdcard/Download/start_render.sh

PATH=/data/data/com.termux/files/usr/bin:$PATH
export PATH

SRC=/sdcard/Download
WEB_DIR=$SRC/maimai_web
SAVE_DIR=$SRC/maimai
CHART_DIR=$SRC/maimai_charts
LOG=$SRC/render.log

echo "=== 1. 检查文件 ==="
if [ ! -f "$SRC/render_server.py" ]; then
    echo "找不到 $SRC/render_server.py，请先 adb push"
    exit 1
fi
for f in worker.html encoder-worker.js render-bundle.js vendor_mp4_muxer.mjs; do
    if [ ! -f "$WEB_DIR/$f" ]; then
        echo "找不到 $WEB_DIR/$f，请先 adb push"
        exit 1
    fi
done
mkdir -p "$SAVE_DIR" "$CHART_DIR" || exit 1
echo "  渲染器: $(ls "$WEB_DIR" | wc -l) 个文件"
echo "  落盘目录: $SAVE_DIR"
echo "  谱面缓存: $CHART_DIR"

echo "=== 2. 停掉旧实例 ==="
OLD=$(ps -A -o PID,ARGS 2>/dev/null | grep '[r]ender_server.py' | awk '{print $1}')
if [ -n "$OLD" ]; then
    for p in $OLD; do kill "$p" 2>/dev/null; done
    sleep 1
    for p in $OLD; do kill -9 "$p" 2>/dev/null; done
    echo "  已清理旧进程: $OLD"
else
    echo "  没有旧进程"
fi
# 旧的独立 save_server.py 会占住 8780，一并请走（现在由 render_server.py 接管）
OLDS=$(ps -A -o PID,ARGS 2>/dev/null | grep '[s]ave_server.py' | awk '{print $1}')
if [ -n "$OLDS" ]; then
    for p in $OLDS; do kill -9 "$p" 2>/dev/null; done
    echo "  已清理旧 save_server: $OLDS"
fi

echo "=== 3. 语法自检 ==="
cd "$SRC" || exit 1
python3 -c "import py_compile; py_compile.compile('render_server.py', doraise=True)" || {
    echo "  语法检查失败，不启动"
    exit 1
}
echo "  语法 OK"

echo "=== 4. 启动 ==="
termux-wake-lock 2>/dev/null
nohup python3 render_server.py --dir "$SAVE_DIR" > "$LOG" 2>&1 &
sleep 4

echo "=== 5. 自检 ==="
H=$(curl -s -m 5 http://127.0.0.1:8777/healthz)
if [ -n "$H" ]; then echo "  渲染页 8777 OK ($H)"; else echo "  渲染页 8777 没起来"; fi
S=$(curl -s -m 5 http://127.0.0.1:8780/health)
if [ -n "$S" ]; then echo "  落盘 8780 OK"; else echo "  落盘 8780 没起来"; fi

echo ""
echo "=== 日志 ($LOG) ==="
tail -n 15 "$LOG"
echo ""
echo "接下来在手机 Chrome 打开（只用打开一次，之后可切后台）："
echo "  http://127.0.0.1:8777/worker.html?bridge=<服务器地址>&token=<密钥>"
echo "服务器那边执行 谱面确认 时会直接把完整地址发给你。"
