@echo off
title MailtraceAI - Stop All Services
color 0C

echo ===================================================================
echo          Stopping all MailtraceAI Services
echo ===================================================================
echo.

powershell -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"

echo Services stopped. Ports 5000 and 5173 are now free.
timeout /t 2 >nul
