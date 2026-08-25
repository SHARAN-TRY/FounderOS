@echo off
title FounderOS Server
cd /d %~dp0backend

:: Open the browser directly to the app in 2 seconds
start "" http://localhost:8000

:: Start the backend server
"%~dp0backend\venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause