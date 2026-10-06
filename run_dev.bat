@echo off
echo ========================================================
echo   Starting FireNotes AI - Meeting Intelligence Platform
echo ========================================================

echo.
echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "FireNotes Backend (FastAPI)" cmd /k "cd backend && .\venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8000"

echo.
echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
start "FireNotes Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Services are starting up:
echo   - Backend API: http://localhost:8000
echo   - API Docs:    http://localhost:8000/docs
echo   - Frontend UI: http://localhost:3000
echo ========================================================
