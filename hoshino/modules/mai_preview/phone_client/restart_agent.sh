#!/system/bin/sh
# 把最新版 agent 换上去并重启。
# 在 Termux 里执行：  sh /sdcard/Download/r4.sh
# 刻意只用 POSIX sh 语法，并逐一回退：这台机器的 bash 已损坏
# （报 cannot execute binary file），故不能依赖 bash / pgrep / pkill。
PATH=/data/data/com.termux/files/usr/bin:$PATH
cd "$HOME" 2>/dev/null || cd /data/data/com.termux/files/home || exit 1

echo "=== 0. 环境 ==="
echo "PWD=$(pwd)"
echo "python3=$(command -v python3 || echo 缺失)"

echo "=== 1. 停掉旧进程 ==="
PIDS=$(ps -A -o PID,ARGS 2>/dev/null | grep '[p]hone_agent.py' | awk '{print $1}')
echo "旧进程 PID: ${PIDS:-无}"
for p in $PIDS; do kill "$p" 2>/dev/null; done
sleep 2
PIDS2=$(ps -A -o PID,ARGS 2>/dev/null | grep '[p]hone_agent.py' | awk '{print $1}')
for p in $PIDS2; do kill -9 "$p" 2>/dev/null; done
sleep 1
echo "剩余: $(ps -A -o ARGS 2>/dev/null | grep -c '[p]hone_agent.py')"

echo "=== 2. 备份并替换 ==="
STAMP=$(date +%s)
if [ -f phone_agent.py ]; then
  cp phone_agent.py "phone_agent.py.bak.$STAMP"
  echo "已备份为 phone_agent.py.bak.$STAMP"
fi
cp /sdcard/Download/phone_agent_v3.py phone_agent.py || { echo "拷贝失败"; exit 2; }
echo "新文件字节: $(wc -c < phone_agent.py)"

echo "=== 3. 关键能力核对 ==="
for k in _bg_tasks _diff_of_name store_video download_to_storage; do
  echo "  $k = $(grep -c "$k" phone_agent.py)"
done

echo "=== 4. 语法自检 ==="
if python3 -c "import py_compile; py_compile.compile('phone_agent.py', doraise=True)" 2>err.txt; then
  echo "语法 OK"
else
  echo "语法错误："
  cat err.txt
  cp "phone_agent.py.bak.$STAMP" phone_agent.py
  exit 3
fi

echo "=== 5. 启动 ==="
command -v termux-wake-lock >/dev/null 2>&1 && termux-wake-lock
nohup python3 phone_agent.py > agent.log 2>&1 &
sleep 5
echo "新进程: $(ps -A -o PID,ARGS 2>/dev/null | grep '[p]hone_agent.py' | awk '{print $1}' | tr '\n' ' ')"
echo "--- agent.log（前 800 字节）---"
head -c 800 agent.log
echo ""
echo "=== 完成 ==="
