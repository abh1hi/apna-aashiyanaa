# Quick Start Script for Firebase Emulator Testing
# Run this script from the repository root to start emulators and frontend

Write-Host "=== Firebase Emulator Quick Start ===" -ForegroundColor Cyan

# Check if Firebase CLI is installed
Write-Host "Checking Firebase CLI..." -ForegroundColor Yellow
try {
  firebase --version | Out-Null
}
catch {
  Write-Host "Firebase CLI not found. Install it with:" -ForegroundColor Red
  Write-Host "npm install -g firebase-tools" -ForegroundColor Yellow
  exit 1
}

Write-Host "Firebase CLI found." -ForegroundColor Green

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "Node.js $nodeVersion found." -ForegroundColor Green

# Step 1: Create .env.local if it doesn't exist
Write-Host "`n=== Step 1: Creating Frontend Config ===" -ForegroundColor Cyan
$envLocalPath = "frontend/client-app/.env.local"
if (-not (Test-Path $envLocalPath)) {
  Write-Host "Creating $envLocalPath from example..." -ForegroundColor Yellow
  Copy-Item "frontend/client-app/.env.local.example" $envLocalPath
  Write-Host "✓ Created $envLocalPath" -ForegroundColor Green
  Write-Host "  Edit this file if you need to change emulator ports." -ForegroundColor Gray
}
else {
  Write-Host "✓ $envLocalPath already exists" -ForegroundColor Green
}

# Step 2: Install dependencies if needed
Write-Host "`n=== Step 2: Installing Dependencies ===" -ForegroundColor Cyan

if (-not (Test-Path "backend/functions/node_modules")) {
  Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
  Push-Location backend/functions
  npm install
  Pop-Location
}
else {
  Write-Host "✓ Backend dependencies already installed" -ForegroundColor Green
}

if (-not (Test-Path "frontend/client-app/node_modules")) {
  Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
  Push-Location frontend/client-app
  npm install
  Pop-Location
}
else {
  Write-Host "✓ Frontend dependencies already installed" -ForegroundColor Green
}

# Step 3: Start emulators
Write-Host "`n=== Step 3: Starting Firebase Emulators ===" -ForegroundColor Cyan
Write-Host "This will start:" -ForegroundColor Yellow
Write-Host "  - Auth Emulator (port 9099)" -ForegroundColor Gray
Write-Host "  - Firestore Emulator (port 8080)" -ForegroundColor Gray
Write-Host "  - Storage Emulator (port 9199)" -ForegroundColor Gray
Write-Host "  - Functions Emulator (port 5001)" -ForegroundColor Gray
Write-Host "  - Emulator UI (http://localhost:4000)" -ForegroundColor Gray

Write-Host "`nStarting emulators in 2 seconds...`n" -ForegroundColor Yellow
Start-Sleep -Seconds 2

Push-Location backend
firebase emulators:start
Pop-Location
