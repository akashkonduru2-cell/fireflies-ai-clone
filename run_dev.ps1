Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting FireNotes AI - Meeting Intelligence Platform  " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "[1/2] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000"

Write-Host ""
Write-Host "[2/2] Starting Next.js Frontend on http://localhost:3000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm.cmd run dev"

Write-Host ""
Write-Host "Services started:" -ForegroundColor Green
Write-Host " - Backend API: http://localhost:8000" -ForegroundColor Green
Write-Host " - API Docs:    http://localhost:8000/docs" -ForegroundColor Green
Write-Host " - Frontend UI: http://localhost:3000" -ForegroundColor Green
