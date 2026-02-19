@echo off
echo ================================
echo MCreation Backend Server
echo ================================
echo.

cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if .env exists
if not exist ".env" (
    echo.
    echo WARNING: .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo Please update the .env file with your database credentials.
    echo Press any key to open .env file...
    pause
    notepad .env
)

echo.
echo Building TypeScript project...
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo Starting development server...
echo Backend will be available at: http://localhost:8000
echo API Health Check: http://localhost:8000/api/health
echo.
call npm run dev
