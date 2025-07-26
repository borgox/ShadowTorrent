#!/usr/bin/env pwsh

# ShadowTorrent Production Test Script
Write-Host "🔒 Testing ShadowTorrent Production Build..." -ForegroundColor Cyan

# Set production environment
$env:NODE_ENV = "production"

# Kill any existing electron processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Stop-Process -Name "electron" -Force -ErrorAction SilentlyContinue

# Start the production app
Write-Host "🚀 Starting ShadowTorrent in production mode..." -ForegroundColor Green
Write-Host "   Environment: PRODUCTION" -ForegroundColor Gray
Write-Host "   Hardening: Main process protection enabled" -ForegroundColor Gray
Write-Host "   Anti-Debug: Keyboard shortcuts blocked, DevTools disabled" -ForegroundColor Gray
Write-Host "" 

# Run the app
npx electron .

Write-Host "✅ ShadowTorrent should now be running!" -ForegroundColor Green
