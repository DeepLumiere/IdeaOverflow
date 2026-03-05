@echo off
echo ======================================
echo  IdeaOverflow Plugin Backend Starter
echo ======================================
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

echo [INFO] Virtual environment activated
echo [INFO] Starting plugin backend on http://localhost:8000
echo [INFO] Press Ctrl+C to stop
echo.

REM Start the plugin backend
python -m uvicorn plugins.overleaf.main:app --reload --port 8000
