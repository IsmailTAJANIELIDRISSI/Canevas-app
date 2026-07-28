@echo off
echo Starting Tyaybi Project...

:: ── Sync with the latest code from the "ismail" branch ──────────────────────
:: Force-overwrites ANY local edits (tracked files AND stray new files) so every
:: user always runs the exact same version. Ignored files (.env, node_modules,
:: model_five, logs) are preserved.
echo.
echo Syncing with latest version (branch: ismail)...
git fetch origin ismail
if errorlevel 1 (
    echo [WARN] git fetch failed - no internet? Continuing with local version...
) else (
    git checkout ismail
    git reset --hard origin/ismail
    git clean -fd
    echo Code is up to date with origin/ismail.
)
echo.

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