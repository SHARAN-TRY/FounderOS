@echo off
title FounderOS All-in-One Runner

:: 1. Start Python Backend in background
start "Backend" /min cmd /c "cd /d E:\backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

:: 2. Start Frontend Dev Server in background
start "Frontend" /min cmd /c "cd /d E:\frontend && npm run dev"

:: 3. Wait 3 seconds and open the app in your browser
timeout /t 3 /nobreak >nul
start "" http://localhost:5173

exit