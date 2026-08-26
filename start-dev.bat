@echo off
chcp 65001 >nul
title Recall AI 开发环境启动器
echo ============================================
echo   Recall AI - 开发环境一键启动
echo ============================================
echo.

REM 检查后端端口 3001 是否已被占用
netstat -ano | findstr ":3001 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] 后端已在运行 (端口 3001)
) else (
    echo [启动] 正在启动后端 (端口 3001)...
    start "Recall-API" cmd /c "cd /d %~dp0api && npm start"
    echo [等待] 后端启动中，请稍候...
    timeout /t 3 /nobreak >nul
)

REM 检查前端端口 5173 是否已被占用
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] 前端已在运行 (端口 5173)
) else (
    echo [启动] 正在启动前端 (端口 5173)...
    start "Recall-Web" cmd /c "cd /d %~dp0web && npm run dev"
    echo [等待] 前端启动中，请稍候...
    timeout /t 6 /nobreak >nul
)

echo.
echo ============================================
echo   启动完成！请在浏览器打开:
echo   前端:  http://localhost:5173
echo   后端:  http://localhost:3001/api/v1/health
echo ============================================
echo.
start http://localhost:5173
echo 已尝试自动打开浏览器，如未弹出请手动访问 http://localhost:5173
echo.
pause
