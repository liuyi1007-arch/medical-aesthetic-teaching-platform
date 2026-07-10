#!/bin/zsh

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
URL="http://localhost:6001/zh/medical-aesthetic"

cd "$PROJECT_DIR"

if ! command -v node >/dev/null 2>&1; then
    echo "未检测到 Node.js，请先安装 Node.js 20 或更高版本。"
    read -r "?按回车键退出..."
    exit 1
fi

if [ ! -d ".next" ]; then
    echo "首次启动：正在生成本地生产版本..."
    npm run build
fi

npm run demo:start &
SERVER_PID=$!

sleep 3
open "$URL"

echo "医学美容设计教学平台已启动：$URL"
echo "关闭此窗口或按 Control+C 可停止服务。"
wait "$SERVER_PID"
