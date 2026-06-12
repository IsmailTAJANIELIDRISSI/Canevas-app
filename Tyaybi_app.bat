@echo off
echo Starting Tyaybi Project...

:: Kill any process already listening on port 3000 (backend)
echo Freeing port 3000...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%P >nul 2>&1
)

:: Start Backend
echo Starting Backend Server...
cd tyaybi_back
start "Tyaybi Backend" cmd /k "node index.js"

:: Start Frontend
echo Starting Frontend...
cd ..\tyaybi_front
start "Tyaybi Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting in separate windows!
echo Backend: usually http://localhost:5000 (or whatever port you use)
echo Frontend: usually http://localhost:3000 or 5173 (Vite)
pause