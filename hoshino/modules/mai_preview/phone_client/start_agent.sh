#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
#  Maimai Phone Agent - Termux 一键启动脚本
# ==============================================================================

set -e

# 定位脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================================="
echo "   Maimai 视频推送服务 - Termux 手机端客户端"
echo "=========================================================="

# 1. 检查 Termux 唤醒锁工具（防止锁屏断网休眠）
if command -v termux-wake-lock >/dev/null 2>&1; then
    echo "[*] 获取 Termux 保持唤醒锁（防止锁屏后系统休眠导致断网）..."
    termux-wake-lock
fi

# 2. 检查存储权限
if [ -d "$HOME/storage/shared" ] || [ -d "/sdcard" ]; then
    echo "[+] 手机存储权限检测正常！"
else
    echo "[!] 警告: 未检测到存储访问权限，正在尝试申请权限..."
    if command -v termux-setup-storage >/dev/null 2>&1; then
        termux-setup-storage
        echo "[!] 请在手机屏幕弹出的授权对话框中点击【允许】访问文件！"
        sleep 2
    else
        echo "[!] 提示: 如果在非 Termux 环境运行，请确保有权访问 /sdcard 目录。"
    fi
fi

# 3. 自动创建默认视频存放目录
VIDEO_DIR="/sdcard/maimai_videos"
if [ -d "/sdcard" ]; then
    if [ ! -d "$VIDEO_DIR" ]; then
        echo "[*] 正在创建默认视频存放目录: $VIDEO_DIR"
        mkdir -p "$VIDEO_DIR" 2>/dev/null || true
    fi
fi
mkdir -p "$SCRIPT_DIR/videos" 2>/dev/null || true

# 4. 检查 Python 运行环境
PYTHON_BIN=""
if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
fi

if [ -z "$PYTHON_BIN" ]; then
    echo "[-] 错误: 未检测到 Python 环境！"
    echo "    请在 Termux 终端运行以下命令安装 Python:"
    echo "    pkg update && pkg install python -y"
    exit 1
fi

PYTHON_VER=$($PYTHON_BIN -c "import sys; print('.'.join(map(str, sys.version_info[:2])))")
echo "[+] 检测到 Python 版本: $PYTHON_VER ($PYTHON_BIN)"

# 5. 检查配置文件
CONFIG_FILE="$SCRIPT_DIR/config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "[*] 未发现 config.json，正在生成默认配置文件..."
    cat > "$CONFIG_FILE" << 'EOF'
{
  "server_host": "127.0.0.1",
  "server_port": 8778,
  "server_ws_path": "/ws",
  "server_upload_path": "/upload",
  "token": "YOUR_SECRET_TOKEN",
  "heartbeat_interval": 10,
  "reconnect_min_delay": 1,
  "reconnect_max_delay": 30,
  "video_directories": [
    "/sdcard/maimai_videos",
    "/sdcard/Download/maimai_videos",
    "/sdcard/Download",
    "~/storage/shared/maimai_videos",
    "~/storage/shared/Download",
    "./videos"
  ],
  "strict_diff_match": false,
  "log_level": "INFO"
}
EOF
    echo "[!] 已生成 config.json！"
    echo "[!] 请务必使用 nano config.json 将 \"server_host\" 改为你的电脑/服务器 IP 地址！"
    echo ""
fi

# 退出时释放唤醒锁
cleanup() {
    echo ""
    echo "[*] 正在退出服务..."
    if command -v termux-wake-unlock >/dev/null 2>&1; then
        termux-wake-unlock 2>/dev/null || true
    fi
    echo "[+] 服务已停止。"
}
trap cleanup EXIT INT TERM

# 6. 启动 Agent
echo "[*] 启动 Phone Agent..."
echo "----------------------------------------------------------"
exec $PYTHON_BIN phone_agent.py "$@"
