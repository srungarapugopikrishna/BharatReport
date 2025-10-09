@echo off
REM Frontend Deployment Script for Windows
REM This script helps prepare and deploy the frontend

echo 🚀 Frontend Deployment Script
echo ================================

REM Check if we're in the right directory
if not exist "client\package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Navigate to client directory
cd client

echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Error: Failed to install dependencies
    pause
    exit /b 1
)

echo 🔧 Setting up environment variables...

REM Create .env file for build
echo REACT_APP_API_URL=https://bharatreport.onrender.com/api > .env.local
echo REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here >> .env.local

echo 🏗️ Building for production...
call npm run build
if errorlevel 1 (
    echo ❌ Error: Build failed
    pause
    exit /b 1
)

echo ✅ Build completed successfully!

echo.
echo 📋 Quick Deployment Options:
echo 1. Render.com (Recommended - since backend is already there)
echo 2. Vercel
echo 3. Netlify
echo 4. Docker
echo.
echo 🎉 Frontend is ready for deployment!
echo Build files are in: client\build\
echo.
echo Next steps:
echo 1. Get your Google OAuth Client ID from Google Cloud Console
echo 2. Update the .env.local file with your actual Google Client ID
echo 3. Choose a deployment platform and follow the instructions
echo.
pause
