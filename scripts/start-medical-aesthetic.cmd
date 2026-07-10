@echo off
setlocal

cd /d "%~dp0\.."
set "URL=http://localhost:6001/zh/medical-aesthetic"

where node >nul 2>nul
if errorlevel 1 (
    echo 未检测到 Node.js，请先安装 Node.js 20 或更高版本。
    pause
    exit /b 1
)

if not exist ".next" (
    echo 首次启动：正在生成本地生产版本...
    call npm run build
    if errorlevel 1 exit /b 1
)

start "medical-aesthetic-server" /B cmd /c npm run demo:start
timeout /t 3 /nobreak >nul
start "" "%URL%"

echo 医学美容设计教学平台已启动：%URL%
echo 关闭此窗口可结束本次启动会话。
pause
