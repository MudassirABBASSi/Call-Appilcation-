# ===================================
# DEPLOYMENT BUILD SCRIPT
# ===================================
# This script prepares your application for Hostinger deployment

Write-Host "🚀 ALBURHAN CLASSROOM - DEPLOYMENT BUILDER" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Create deployment folder
$deploymentFolder = ".\deployment-package"
Write-Host "📁 Creating deployment package..." -ForegroundColor Yellow

if (Test-Path $deploymentFolder) {
    Remove-Item -Path $deploymentFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $deploymentFolder | Out-Null
New-Item -ItemType Directory -Path "$deploymentFolder\backend" | Out-Null
New-Item -ItemType Directory -Path "$deploymentFolder\frontend-build" | Out-Null

# ===================================
# STEP 1: Build Frontend
# ===================================
Write-Host ""
Write-Host "⚛️  STEP 1: Building React Frontend..." -ForegroundColor Green
Set-Location frontend

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ ERROR: frontend/.env.production not found!" -ForegroundColor Red
    Write-Host "Please create it with:" -ForegroundColor Yellow
    Write-Host "REACT_APP_API_URL=https://app.alburhanacademy.com/api" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Build React app
Write-Host "🔨 Building production React app..." -ForegroundColor Yellow
$env:REACT_APP_ENV = "production"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Copy build files to deployment package
Write-Host "📋 Copying frontend build files..." -ForegroundColor Yellow
Copy-Item -Path "build\*" -Destination "..\$deploymentFolder\frontend-build" -Recurse -Force

Set-Location ..
Write-Host "✅ Frontend built successfully!" -ForegroundColor Green

# ===================================
# STEP 2: Prepare Backend
# ===================================
Write-Host ""
Write-Host "🖥️  STEP 2: Preparing Backend Files..." -ForegroundColor Green
Set-Location backend

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ ERROR: backend/.env.production not found!" -ForegroundColor Red
    Write-Host "Please create it with your production settings" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

# Copy backend files (excluding node_modules and dev files)
Write-Host "📋 Copying backend files..." -ForegroundColor Yellow

$backendFiles = @(
    "*.js",
    "package.json",
    "package-lock.json",
    ".env.production",
    "config",
    "controllers",
    "middleware",
    "models",
    "routes",
    "utils",
    "cron",
    "services",
    "database",
    "validation"
)

foreach ($item in $backendFiles) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination "..\$deploymentFolder\backend\" -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Rename .env.production to .env in deployment package
if (Test-Path "..\$deploymentFolder\backend\.env.production") {
    Rename-Item -Path "..\$deploymentFolder\backend\.env.production" -NewName ".env" -Force
}

Set-Location ..
Write-Host "✅ Backend prepared successfully!" -ForegroundColor Green

# ===================================
# STEP 3: Create Additional Files
# ===================================
Write-Host ""
Write-Host "📄 STEP 3: Creating deployment files..." -ForegroundColor Green

# Copy .htaccess template
if (Test-Path ".htaccess.template") {
    Copy-Item -Path ".htaccess.template" -Destination "$deploymentFolder\frontend-build\.htaccess" -Force
    Write-Host "✅ .htaccess file created" -ForegroundColor Green
}

# Create README for deployment package
$readmeContent = @"
# ALBURHAN CLASSROOM - DEPLOYMENT PACKAGE
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## 📦 CONTENTS

### 1. backend/
- All Node.js backend files
- .env file (UPDATE with your Hostinger credentials!)
- Upload to: /home/username/app-backend/

### 2. frontend-build/
- React production build
- .htaccess file (UPDATE PORT_NUMBER!)
- Upload to: /public_html/app.alburhanacademy.com/

## 🚀 DEPLOYMENT STEPS

1. **Create MySQL Database in Hostinger hPanel**
   - Database name: alburhan_classroom
   - Import: backend/database/schema.sql

2. **Update backend/.env file**
   - Database credentials
   - JWT secret
   - Email settings

3. **Upload backend/ folder to Hostinger**
   - Via FTP to: /home/username/app-backend/
   - SSH in and run: npm install --production

4. **Set up Node.js App in hPanel**
   - Application root: /home/username/app-backend
   - Startup file: server.js
   - Note the PORT number assigned

5. **Update frontend-build/.htaccess**
   - Replace PORT_NUMBER with actual port from step 4

6. **Upload frontend-build/ to Hostinger**
   - Via FTP to: /public_html/app.alburhanacademy.com/

7. **Test your application**
   - Visit: https://app.alburhanacademy.com

## 📚 FULL GUIDE
See HOSTINGER_DEPLOYMENT_GUIDE.md for complete instructions

## ⚠️ IMPORTANT
- Change all default passwords!
- Update JWT_SECRET in .env
- Configure email settings
- Enable SSL certificate in hPanel
"@

Set-Content -Path "$deploymentFolder\README.txt" -Value $readmeContent -Force
Write-Host "✅ README.txt created" -ForegroundColor Green

# ===================================
# STEP 4: Create Archive
# ===================================
Write-Host ""
Write-Host "📦 STEP 4: Creating ZIP archive..." -ForegroundColor Green

$zipPath = ".\alburhan-classroom-deployment.zip"
if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}

# Create ZIP archive
Compress-Archive -Path "$deploymentFolder\*" -DestinationPath $zipPath -Force

$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "✅ Archive created: alburhan-classroom-deployment.zip ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green

# ===================================
# COMPLETION
# ===================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✨ DEPLOYMENT PACKAGE READY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Files created:" -ForegroundColor Yellow
Write-Host "   - deployment-package/ (folder)" -ForegroundColor White
Write-Host "   - alburhan-classroom-deployment.zip ($(([math]::Round($zipSize, 2))) MB)" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Extract the ZIP file" -ForegroundColor White
Write-Host "   2. Update backend/.env with your Hostinger database credentials" -ForegroundColor White
Write-Host "   3. Update frontend-build/.htaccess with Node.js port number" -ForegroundColor White
Write-Host "   4. Follow HOSTINGER_DEPLOYMENT_GUIDE.md for upload instructions" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Happy Deploying! 🚀" -ForegroundColor Cyan
Write-Host ""
