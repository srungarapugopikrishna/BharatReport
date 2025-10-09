# Frontend Deployment Script for Windows PowerShell
# This script helps prepare and deploy the frontend

param(
    [Parameter(Mandatory=$false)]
    [string]$Platform = "render",
    
    [Parameter(Mandatory=$false)]
    [string]$GoogleClientId = "",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiUrl = "https://bharatreport.onrender.com/api"
)

Write-Host "🚀 Frontend Deployment Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "client/package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Navigate to client directory
Set-Location client

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Setting up environment variables..." -ForegroundColor Yellow

# Create .env file for build
$envContent = @"
REACT_APP_API_URL=$ApiUrl
REACT_APP_GOOGLE_CLIENT_ID=$GoogleClientId
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "🏗️ Building for production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Platform-specific deployment instructions
switch ($Platform.ToLower()) {
    "render" {
        Write-Host "`n📋 Render.com Deployment Instructions:" -ForegroundColor Cyan
        Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor White
        Write-Host "2. Click 'New +' → 'Static Site'" -ForegroundColor White
        Write-Host "3. Connect your GitHub repository" -ForegroundColor White
        Write-Host "4. Set Root Directory: client" -ForegroundColor White
        Write-Host "5. Set Build Command: npm install && npm run build" -ForegroundColor White
        Write-Host "6. Set Publish Directory: build" -ForegroundColor White
        Write-Host "7. Add Environment Variables:" -ForegroundColor White
        Write-Host "   - REACT_APP_API_URL: $ApiUrl" -ForegroundColor Gray
        Write-Host "   - REACT_APP_GOOGLE_CLIENT_ID: $GoogleClientId" -ForegroundColor Gray
    }
    "vercel" {
        Write-Host "`n📋 Vercel Deployment Instructions:" -ForegroundColor Cyan
        Write-Host "1. Install Vercel CLI: npm install -g vercel" -ForegroundColor White
        Write-Host "2. Run: vercel" -ForegroundColor White
        Write-Host "3. Set Root Directory: client" -ForegroundColor White
        Write-Host "4. Add Environment Variables in Vercel Dashboard" -ForegroundColor White
    }
    "netlify" {
        Write-Host "`n📋 Netlify Deployment Instructions:" -ForegroundColor Cyan
        Write-Host "1. Go to https://netlify.com" -ForegroundColor White
        Write-Host "2. Drag and drop the 'client/build' folder" -ForegroundColor White
        Write-Host "3. Or connect your GitHub repository" -ForegroundColor White
        Write-Host "4. Set Base directory: client" -ForegroundColor White
        Write-Host "5. Set Build command: npm run build" -ForegroundColor White
        Write-Host "6. Set Publish directory: client/build" -ForegroundColor White
    }
    "docker" {
        Write-Host "`n📋 Docker Deployment Instructions:" -ForegroundColor Cyan
        Write-Host "1. Build image: docker build -f ../config/Dockerfile.frontend -t bharat-report-frontend ." -ForegroundColor White
        Write-Host "2. Run container: docker run -p 3000:3000 -e REACT_APP_API_URL=$ApiUrl -e REACT_APP_GOOGLE_CLIENT_ID=$GoogleClientId bharat-report-frontend" -ForegroundColor White
    }
    default {
        Write-Host "`n📋 Available platforms: render, vercel, netlify, docker" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Frontend is ready for deployment!" -ForegroundColor Green
Write-Host "Build files are in: client/build/" -ForegroundColor White

# Go back to project root
Set-Location ..
