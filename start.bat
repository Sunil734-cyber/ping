@echo off
echo ========================================
echo PingDaily - Starting Application
echo ========================================
echo.

echo Checking MongoDB status...
sc query MongoDB | find "RUNNING" >nul
if errorlevel 1 (
    echo MongoDB is not running. Attempting to start...
    net start MongoDB
    if errorlevel 1 (
        echo.
        echo WARNING: Could not start MongoDB!
        echo.
        echo Please either:
        echo 1. Install MongoDB from https://www.mongodb.com/try/download/community
        echo 2. Start MongoDB manually: net start MongoDB
        echo 3. Use MongoDB Atlas and update MONGODB_URI in .env
        echo.
        echo The app will still work with localStorage as fallback.
        echo.
        pause
    ) else (
        echo MongoDB started successfully!
    )
) else (
    echo MongoDB is already running!
)

echo.
echo Starting PingDaily application...
echo Frontend will run on: http://localhost:5173
echo Backend API will run on: http://localhost:5000
echo.
echo Press Ctrl+C to stop the servers
echo.

npm run dev:all
