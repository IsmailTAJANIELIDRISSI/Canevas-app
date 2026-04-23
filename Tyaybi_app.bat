@echo off
echo Starting Tyaybi Project...

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