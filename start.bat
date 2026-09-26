@echo off
title MailtraceAI Launcher
color 0A

echo ===================================================================
echo               MAILTRACE AI - SYSTEM LAUNCHER
echo ===================================================================
echo.

cd /d "%~dp0"

echo [1/3] Clearing any stuck ports (5000, 5173)...
powershell -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"

echo [2/3] Checking dependencies...
if not exist "node_modules\" (
    echo   - Installing root dependencies...
    call npm install
)
if not exist "server\node_modules\" (
    echo   - Installing server dependencies...
    cd server && call npm install && cd ..
)
if not exist "client\node_modules\" (
    echo   - Installing client dependencies...
    cd client && call npm install && cd ..
)

echo [3/3] Starting Backend and Frontend services...
echo.
echo   - Backend Server  : http://localhost:5000/health
echo   - Frontend Client : http://localhost:5173/
echo.

start "MailtraceAI - Backend Server" /D "%~dp0server" cmd /k "npm run dev"
start "MailtraceAI - Frontend Client" /D "%~dp0client" cmd /k "npm run dev"

echo Opening browser at http://localhost:5173 ...
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

echo.
echo ===================================================================
echo   MailtraceAI is running!
echo   To STOP all services, run 'stop.bat' or close the terminal windows.
echo ===================================================================
echo.
pause
