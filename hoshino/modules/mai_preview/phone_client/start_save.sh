#!/data/data/com.termux/files/usr/bin/bash
# start_save.sh —— 在 Termux 里启动手机本地落盘服务。
# 由电脑侧通过 `bash ~/start_save.sh` 调用（见部署文档）。

set -u

cd "$HOME" || exit 1

# 1. 先把脚本从共享存储复制到家目录（adb shell 没权限直接写 ~/）
if [ -f /sdcard/Download/save_server.py ]; then
    cp -f /sdcard/Download/save_server.py "$HOME/save_server.py"
fi

if [ ! -f "$HOME/save_server.py" ]; then
    echo "找不到 save_server.py，先把文件推到 /sdcard/Download/"
    exit 2
fi

echo "=== save_server.py: $(wc -c < "$HOME/save_server.py") 字节 ==="

# 2. 停掉旧实例
pkill -f save_server.py 2>/dev/null
sleep 1
if pgrep -f save_server.py >/dev/null 2>&1; then
    echo "旧实例没停掉，强制杀"
    pkill -9 -f save_server.py 2>/dev/null
    sleep 1
fi

# 3. 唤醒锁（避免息屏后被系统冻结）
termux-wake-lock 2>/dev/null || echo "（termux-wake-lock 不可用，跳过）"

# 4. 后台启动
nohup python3 "$HOME/save_server.py" > "$HOME/save.log" 2>&1 &
NEWPID=$!
echo "新进程 PID: $NEWPID"
sleep 3

# 5. 自检
echo "=== 进程检查 ==="
pgrep -f save_server.py || echo "（进程不在！）"

echo "=== 健康检查 ==="
curl -s --max-time 5 http://127.0.0.1:8780/health || echo "（健康检查失败）"
echo ""

echo "=== 日志前 15 行 ==="
head -15 "$HOME/save.log" 2>/dev/null

echo "=== 完成 ==="
