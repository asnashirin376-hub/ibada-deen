@echo off
title Ibadah Daily - Islamic Companion
echo Starting Ibadah Daily application...
start http://localhost:8080/index.html
python serve.py
if %ERRORLEVEL% NEQ 0 (
    py serve.py
)
pause
