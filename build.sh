#!/bin/bash

echo "🚀 Starting JanataReport build process..."

# Set environment variables
export CI=false
export NODE_ENV=production

# Navigate to client directory
cd client

echo "📁 Current directory: $(pwd)"
echo "📋 Directory contents:"
ls -la

# Check if required files exist
echo "🔍 Checking for required files..."

if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json not found"
    exit 1
fi

if [ -f "public/index.html" ]; then
    echo "✅ public/index.html found"
else
    echo "❌ public/index.html not found"
    echo "📋 Contents of public directory:"
    ls -la public/
    exit 1
fi

if [ -f "src/index.js" ]; then
    echo "✅ src/index.js found"
else
    echo "❌ src/index.js not found"
    echo "📋 Contents of src directory:"
    ls -la src/
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the React app
echo "🔨 Building React application..."
npm run build

# Check if build was successful
if [ -d "build" ]; then
    echo "✅ Build completed successfully!"
    echo "📋 Build directory contents:"
    ls -la build/
    echo "📋 Build directory size:"
    du -sh build/
else
    echo "❌ Build failed - build directory not found"
    exit 1
fi

echo "🎉 Build process completed successfully!"
