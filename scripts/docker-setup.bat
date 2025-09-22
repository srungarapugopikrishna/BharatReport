@echo off
echo JanataReport Docker Setup
echo ========================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed. Please install Docker Desktop first.
    echo Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo Docker is available. Starting setup...

REM Create environment files
echo Creating environment files...
if not exist "server\.env" (
    copy server\env.example server\.env
    echo Created server\.env file
)

if not exist "client\.env" (
    echo REACT_APP_API_URL=http://localhost:5000/api > client\.env
    echo REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key >> client\.env
    echo Created client\.env file
)

REM Build and start containers
echo Building and starting containers...
docker-compose up --build

pause
