#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Custom React Build Script');
console.log('============================');

// Get current working directory
const cwd = process.cwd();
console.log('Current working directory:', cwd);

// Check if we're in the right directory
const packageJsonPath = path.join(cwd, 'package.json');
const publicPath = path.join(cwd, 'public');
const srcPath = path.join(cwd, 'src');

console.log('\n📁 Checking directory structure...');
console.log('Package.json exists:', fs.existsSync(packageJsonPath));
console.log('Public directory exists:', fs.existsSync(publicPath));
console.log('Src directory exists:', fs.existsSync(srcPath));

if (fs.existsSync(publicPath)) {
  const publicContents = fs.readdirSync(publicPath);
  console.log('Public directory contents:', publicContents);
  
  const indexHtmlPath = path.join(publicPath, 'index.html');
  console.log('index.html exists:', fs.existsSync(indexHtmlPath));
  
  if (fs.existsSync(indexHtmlPath)) {
    console.log('✅ index.html found in public directory');
  } else {
    console.log('❌ index.html not found in public directory');
    process.exit(1);
  }
} else {
  console.log('❌ Public directory not found');
  process.exit(1);
}

// Set environment variables
process.env.CI = 'false';
process.env.NODE_ENV = 'production';

console.log('\n🔧 Environment variables:');
console.log('CI:', process.env.CI);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Try to build using react-scripts directly
console.log('\n🔨 Starting build process...');

try {
  // First, try to install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd });
  
  // Then try to build
  console.log('🔨 Building React app...');
  execSync('npx react-scripts build', { 
    stdio: 'inherit', 
    cwd,
    env: { ...process.env, CI: 'false' }
  });
  
  // Check if build was successful
  const buildPath = path.join(cwd, 'build');
  if (fs.existsSync(buildPath)) {
    console.log('✅ Build completed successfully!');
    console.log('Build directory contents:');
    const buildContents = fs.readdirSync(buildPath);
    console.log(buildContents);
  } else {
    console.log('❌ Build failed - build directory not found');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build failed with error:', error.message);
  console.error('Error details:', error);
  process.exit(1);
}

console.log('\n🎉 Custom build completed successfully!');
