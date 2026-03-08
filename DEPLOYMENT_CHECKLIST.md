# 🚀 HOSTINGER DEPLOYMENT - QUICK CHECKLIST

## ⏱️ Estimated Time: 2-3 Hours

---

## PRE-DEPLOYMENT (30 minutes)

### Local Preparation
- [ ] Run `.\build-for-deployment.ps1` to create deployment package
- [ ] Extract `alburhan-classroom-deployment.zip`
- [ ] Update `backend/.env` with production values:
  - [ ] Database credentials (will get from Hostinger)
  - [ ] JWT_SECRET (generate random 32+ character string)
  - [ ] Email credentials (Gmail app password)
  - [ ] FRONTEND_URL=https://app.alburhanacademy.com

### Hostinger Account Setup
- [ ] Login to Hostinger hPanel: https://hpanel.hostinger.com
- [ ] Verify Business Web Hosting plan is active
- [ ] Note your main FTP credentials (Files → FTP Accounts)

---

## PHASE 1: DATABASE SETUP (15 minutes)

- [ ] hPanel → Databases → MySQL Databases
- [ ] Click "Create New Database"
  - [ ] Database name: `alburhan_classroom`
  - [ ] Username: `alburhan_user` (or custom)
  - [ ] Password: (generate strong password)
  - [ ] Grant ALL PRIVILEGES
- [ ] **Copy these credentials** to `backend/.env` file
- [ ] Go to phpMyAdmin
  - [ ] Select `alburhan_classroom` database
  - [ ] Import → Choose file: `backend/database/schema.sql`
  - [ ] Click "Go"
- [ ] Verify tables created (users, classes, assignments, etc.)

---

## PHASE 2: SUBDOMAIN & SSL (15 minutes)

- [ ] hPanel → Domains → Subdomains
- [ ] Click "Create Subdomain"
  - [ ] Subdomain: `app`
  - [ ] Domain: `alburhanacademy.com`
  - [ ] Document root: `/public_html/app.alburhanacademy.com`
- [ ] Wait 5-10 minutes for DNS propagation
- [ ] hPanel → Security → SSL
  - [ ] Find `app.alburhanacademy.com`
  - [ ] Install Free SSL (Let's Encrypt)
  - [ ] Wait for "Active" status

---

## PHASE 3: NODE.JS SETUP (10 minutes)

- [ ] hPanel → Advanced → Node.js
- [ ] Click "Setup New Application"
  - [ ] Application mode: **Production**
  - [ ] Application root: `/home/YOUR_USERNAME/app-backend`
  - [ ] Application URL: `app.alburhanacademy.com`
  - [ ] Startup file: `server.js`
  - [ ] Node.js version: **18.x or 20.x** (latest stable)
- [ ] Click "Create"
- [ ] **⚠️ IMPORTANT: Note the PORT number shown** (e.g., 3000, 4000, etc.)
- [ ] Keep this page open - you'll need the port number!

---

## PHASE 4: UPLOAD BACKEND (30 minutes)

### Connect FTP
- [ ] Open FileZilla (or FTP client)
- [ ] Connect:
  - Host: `ftp.alburhanacademy.com` (or IP from hPanel)
  - Username: Your FTP username
  - Password: Your FTP password
  - Port: 21

### Upload Backend Files
- [ ] Navigate to: `/home/YOUR_USERNAME/app-backend/`
- [ ] Upload all files from `deployment-package/backend/`:
  - [ ] All `.js` files (server.js, etc.)
  - [ ] package.json & package-lock.json
  - [ ] .env file (with updated credentials)
  - [ ] All folders: config/, controllers/, middleware/, models/, routes/, utils/, etc.
  - [ ] **DO NOT upload node_modules/** (will install via SSH)

### Verify Upload
- [ ] Check file count matches your local backend folder
- [ ] Ensure .env file is present and correct

---

## PHASE 5: INSTALL DEPENDENCIES (20 minutes)

### Access SSH
- [ ] hPanel → Advanced → SSH Access
- [ ] Enable SSH (if not enabled)
- [ ] Download/Open SSH client:
  - Windows: **PuTTY** or Windows Terminal
  - Mac/Linux: Built-in Terminal
- [ ] Connect:
  ```bash
  ssh YOUR_USERNAME@YOUR_SERVER_IP
  # Enter password when prompted
  ```

### Install Node Modules
```bash
# Navigate to backend
cd ~/app-backend

# Verify files are there
ls -la

# Check .env file exists and has correct values
cat .env

# Install production dependencies
npm install --production

# This will take 3-5 minutes
# Should install: express, mysql2, bcryptjs, jsonwebtoken, etc.

# Verify installation
npm list --depth=0
```

### Test Backend
```bash
# Try starting manually (for testing)
node server.js

# Should show: "Server running on port XXXX"
# Press Ctrl+C to stop
```

- [ ] No errors during `npm install`
- [ ] Backend can start without errors

---

## PHASE 6: UPDATE .HTACCESS (10 minutes)

### Edit .htaccess File
- [ ] Open `deployment-package/frontend-build/.htaccess` in text editor
- [ ] Find this line:
  ```apache
  RewriteRule ^api/(.*)$ http://localhost:PORT_NUMBER/api/$1 [P,L]
  ```
- [ ] **Replace `PORT_NUMBER`** with actual port from PHASE 3 (e.g., 3000)
  ```apache
  RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
  ```
- [ ] Also update this line:
  ```apache
  Header set Access-Control-Allow-Origin "https://app.alburhanacademy.com"
  ```
- [ ] Save file

---

## PHASE 7: UPLOAD FRONTEND (20 minutes)

### Upload Frontend Files
- [ ] In FileZilla, navigate to: `/public_html/app.alburhanacademy.com/`
- [ ] **Delete any default files** (index.html, etc.)
- [ ] Upload **ALL files** from `deployment-package/frontend-build/`:
  - [ ] index.html
  - [ ] .htaccess (updated with correct port)
  - [ ] static/ folder (contains CSS, JS files)
  - [ ] manifest.json
  - [ ] favicon.ico
  - [ ] asset-manifest.json
  - [ ] Any other files from build folder

### Verify Upload
- [ ] All files uploaded successfully
- [ ] .htaccess file is present
- [ ] static/ folder contains CSS and JS files

---

## PHASE 8: START APPLICATION (10 minutes)

- [ ] Go back to hPanel → Node.js
- [ ] Find your `app-backend` application
- [ ] Click "**Run npm install**" if button available
- [ ] Click "**Restart Application**"
- [ ] Application Status should show: **"Running"** (green)
- [ ] If error, click "View Logs" to see what went wrong

### Common Issues:
- **Port already in use:** Stop and restart the app
- **Module not found:** Re-run `npm install` via SSH
- **Database connection error:** Check `.env` credentials

---

## PHASE 9: TESTING (30 minutes)

### Test Frontend
- [ ] Open browser: `https://app.alburhanacademy.com`
- [ ] Should show login page (not blank)
- [ ] Press F12 → Console tab
- [ ] Should see NO red errors
- [ ] If errors, check .htaccess proxy rule

### Test API Connection
- [ ] In browser, go to: `https://app.alburhanacademy.com/api/health`
- [ ] Should show: `{"status":"ok","message":"Server is running"}`
- [ ] If 404, check Node.js app is running
- [ ] If 502, check .htaccess PORT_NUMBER is correct

### Create Admin User (via SSH)
```bash
cd ~/app-backend

# Generate password hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"

# Copy the output hash
# Go to phpMyAdmin and run:
```

- [ ] In phpMyAdmin:
```sql
INSERT INTO users (email, password_hash, role, firstname, lastname, is_active) 
VALUES (
  'admin@alburhanacademy.com',
  'PASTE_HASH_HERE',
  'admin',
  'Admin',
  'User',
  1
);
```

### Test Login
- [ ] Login with:
  - Email: `admin@alburhanacademy.com`
  - Password: `admin123`
- [ ] Should redirect to admin dashboard
- [ ] Check Network tab (F12) for API calls
- [ ] All API calls should return 200 or 201

### Test Features
- [ ] Admin can create teacher account
- [ ] Admin can create student account
- [ ] Teacher can login
- [ ] Student can login
- [ ] Create class
- [ ] Create assignment
- [ ] Submit assignment (as student)
- [ ] View submissions (as teacher)
- [ ] Send message
- [ ] Create notification
- [ ] File upload works

---

## PHASE 10: SECURITY & OPTIMIZATION (20 minutes)

### Change Default Passwords
- [ ] Change admin password in app (profile settings)
- [ ] Update .env JWT_SECRET (restart app after)

### Database Security
- [ ] In phpMyAdmin, create DB backup
- [ ] hPanel → Backups → Create backup now
- [ ] Enable automatic weekly backups

### Performance
- [ ] hPanel → Domains → Cloudflare (optional)
  - [ ] Enable for alburhanacademy.com
  - [ ] SSL: Full (Strict)
  - [ ] Enable Auto Minify (JS, CSS, HTML)
  - [ ] Enable Brotli

### Monitoring
- [ ] hPanel → Uptime Monitoring
- [ ] Add: `https://app.alburhanacademy.com`
- [ ] Set email for downtime alerts

---

## POST-DEPLOYMENT

### Documentation
- [ ] Document your database credentials (store securely)
- [ ] Save FTP credentials
- [ ] Save SSH credentials
- [ ] Note Node.js port number used
- [ ] Keep backup of .env file (encrypted/secure location)

### User Guide
- [ ] Create user accounts for teachers
- [ ] Create user accounts for students
- [ ] Send login instructions
- [ ] Provide training/demo

### Monitoring
- [ ] Check application daily for first week
- [ ] Review error logs: hPanel → Node.js → View Logs
- [ ] Monitor disk space usage
- [ ] Check database size weekly

---

## 🎉 DEPLOYMENT COMPLETE!

### Your Application is Live:
🌐 **https://app.alburhanacademy.com**

### Login URLs:
- Admin: https://app.alburhanacademy.com/login
- Teacher: https://app.alburhanacademy.com/login
- Student: https://app.alburhanacademy.com/login

### Support Resources:
- Hostinger 24/7 Support: Live chat in hPanel
- Documentation: HOSTINGER_DEPLOYMENT_GUIDE.md
- Troubleshooting: See guide Phase 10

---

## TROUBLESHOOTING QUICK FIXES

### "Cannot connect to database"
```bash
# SSH into server
cd ~/app-backend
cat .env  # Check credentials
# Fix .env file if wrong
nano .env  # Edit values
# Restart app in hPanel
```

### "API 404 errors"
- Check Node.js app is Running in hPanel
- Verify .htaccess PORT_NUMBER is correct
- Test API: `curl http://localhost:3000/api/health` (via SSH)

### "CORS errors"
- Update backend/server.js CORS origin
- Restart Node.js app
- Clear browser cache

### "App won't start"
```bash
# SSH into server
cd ~/app-backend
npm install --production  # Reinstall
node server.js  # See actual error
# Fix error, then restart in hPanel
```

---

**Created:** March 7, 2026  
**Deployment Platform:** Hostinger Business Web Hosting  
**Estimated Total Time:** 2-3 hours for first deployment  
**Difficulty:** Intermediate (detailed instructions provided)
