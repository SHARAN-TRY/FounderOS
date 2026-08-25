@echo off
title FounderOS Server
cd /d E:\backend

:: Open the browser directly to the app in 2 seconds
start "" http://localhost:8000

:: Start the backend server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause