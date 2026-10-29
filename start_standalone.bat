@echo off
title IntelliGreen Standalone Field Portal Server
echo ========================================================
echo   Launching IntelliGreen Standalone Field Portal
echo   Running Frontend + Backend together on Port 8000
echo ========================================================

cd /d "%~dp0"

IF EXIST "backend\.venv\Scripts\python.exe" (
    backend\.venv\Scripts\python.exe start_standalone.py
) ELSE (
    python start_standalone.py
)

pause
