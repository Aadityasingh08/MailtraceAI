# MailtraceAI PowerShell Launcher
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "         MAILTRACE AI - AUTOMATED LAUNCHER            " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

# 1. Clear stuck ports
Write-Host "[1/3] Clearing any stuck ports (5000, 5173)..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

# 2. Check dependencies
Write-Host "[2/3] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    npm install
}
if (-not (Test-Path "server\node_modules")) {
    npm --prefix server install
}
if (-not (Test-Path "client\node_modules")) {
    npm --prefix client install
}

# 3. Launch
Write-Host "`n[3/3] Launching Backend & Frontend concurrently..." -ForegroundColor Green
Write-Host "Backend  : http://localhost:5000/health" -ForegroundColor DarkCyan
Write-Host "Frontend : http://localhost:5173/" -ForegroundColor DarkMagenta
Write-Host "Press Ctrl+C to stop both servers.`n" -ForegroundColor DarkGray

Start-Process "http://localhost:5173"

npm start
