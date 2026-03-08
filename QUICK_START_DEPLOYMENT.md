# 🚀 QUICK START - Hostinger Deployment

## ⚡ Fast Track Deployment (2 hours)

---

## BEFORE YOU START

**You Need:**
1. ✅ Hostinger Business Web Hosting account
2. ✅ Access to hPanel (https://hpanel.hostinger.com)
3. ✅ Domain: alburhanacademy.com
4. ✅ FTP client installed (FileZilla)
5. ✅ This application code ready

---

## 🎯 3-STEP DEPLOYMENT

### STEP 1: BUILD (15 minutes)

1. **Run the build script:**
   ```powershell
   .\build-for-deployment.ps1
   ```

2. **Extract the ZIP:**
   - File created: `alburhan-classroom-deployment.zip`
   - Extract to get `deployment-package/` folder

3. **Update Configuration:**
   
   **A. Backend `.env` file:**
   - Open: `deployment-package/backend/.env`
   - Update these (you'll get DB credentials from Hostinger in Step 2):
   ```env
   DB_HOST=localhost
   DB_USER=your_db_username     ← UPDATE
   DB_PASSWORD=your_db_password ← UPDATE
   DB_NAME=alburhan_classroom
   JWT_SECRET=CHANGE_THIS_TO_RANDOM_32_CHAR_STRING ← UPDATE
   EMAIL_USER=your-email@gmail.com ← UPDATE
   EMAIL_PASSWORD=your-app-password ← UPDATE
   FRONTEND_URL=https://app.alburhanacademy.com
   ```

   **B. Frontend `.htaccess` file:**
   - Open: `deployment-package/frontend-build/.htaccess`
   - Find line 11 (will update later with actual port):
   ```apache
   RewriteRule ^api/(.*)$ http://localhost:PORT_NUMBER/api/$1 [P,L]
   ```

---

### STEP 2: HOSTINGER SETUP (30 minutes)

#### 2.1 Create Database (5 min)
1. Login to hPanel → **Databases** → **MySQL Databases**
2. Create database:
   - Name: `alburhan_classroom`
   - User: `alburhan_user`
   - Password: (generate strong one)
   - Privileges: **ALL**
3. **Copy credentials to `backend/.env` file**
4. Go to **phpMyAdmin** → Select database
5. **Import** → Choose: `backend/database/schema.sql` → **Go**

#### 2.2 Create Subdomain (5 min)
1. hPanel → **Domains** → **Subdomains**
2. Create:
   - Subdomain: `app`
   - Domain: `alburhanacademy.com`
   - Root: `/public_html/app.alburhanacademy.com`
3. Wait 5 minutes for DNS

#### 2.3 Enable SSL (5 min)
1. hPanel → **Security** → **SSL**
2. Find `app.alburhanacademy.com`
3. **Install Free SSL** (Let's Encrypt)
4. Wait for "Active" status

#### 2.4 Set Up Node.js (10 min)
1. hPanel → **Advanced** → **Node.js**
2. **Setup New Application:**
   - Mode: **Production**
   - Root: `/home/YOUR_USERNAME/app-backend`
   - URL: `app.alburhanacademy.com`
   - File: `server.js`
   - Version: **18.x** or **20.x**
3. **IMPORTANT: Write down the PORT number** (e.g., 3000)
4. Don't start yet (no files uploaded)

#### 2.5 Update .htaccess with Port
1. Edit: `deployment-package/frontend-build/.htaccess`
2. Update line 11 with YOUR port number:
   ```apache
   RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
   ```
3. Save file

---

### STEP 3: UPLOAD & LAUNCH (30 minutes)

#### 3.1 Upload Backend (15 min)
1. **Open FileZilla:**
   - Host: `ftp.alburhanacademy.com`
   - User: (from hPanel → FTP Accounts)
   - Password: (your FTP password)
   - Port: 21

2. **Navigate to:** `/home/YOUR_USERNAME/app-backend/`

3. **Upload all from `deployment-package/backend/`:**
   - All files and folders
   - Including `.env` file

#### 3.2 Install Dependencies (10 min)
1. **Get SSH credentials:** hPanel → SSH Access
2. **Connect via SSH:**
   ```bash
   ssh YOUR_USERNAME@YOUR_IP
   ```
3. **Install:**
   ```bash
   cd ~/app-backend
   npm install --production
   ```
4. **Wait 3-5 minutes for installation**

#### 3.3 Upload Frontend (10 min)
1. **In FileZilla, go to:** `/public_html/app.alburhanacademy.com/`
2. **Delete default files** (if any)
3. **Upload all from `deployment-package/frontend-build/`:**
   - index.html
   - .htaccess
   - static/ folder
   - All other files

#### 3.4 Start Application (5 min)
1. **hPanel** → **Node.js**
2. Find your app
3. Click **"Restart Application"**
4. Status should show: **"Running"** ✅

---

## 4. TEST YOUR APPLICATION

### Quick Tests:

1. **Frontend:** https://app.alburhanacademy.com
   - Should show login page ✅

2. **API Health:** https://app.alburhanacademy.com/api/health
   - Should show: `{"status":"ok"}` ✅

3. **Create Admin User:**
   ```bash
   # Via SSH:
   cd ~/app-backend
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
   ```
   - Copy the hash
   - In phpMyAdmin → Run SQL:
   ```sql
   INSERT INTO users (email, password_hash, role, firstname, lastname, is_active) 
   VALUES ('admin@alburhanacademy.com', 'PASTE_HASH_HERE', 'admin', 'Admin', 'User', 1);
   ```

4. **Login:**
   - Email: `admin@alburhanacademy.com`
   - Password: `admin123`
   - Should access admin dashboard ✅

---

## ✅ DONE!

Your application is now live at:
### 🎓 https://app.alburhanacademy.com

---

## 🚨 TROUBLESHOOTING

### Problem: "Cannot connect to database"
**Fix:** Check `.env` database credentials via SSH:
```bash
cd ~/app-backend
cat .env
nano .env  # Edit if wrong
```
Then restart app in hPanel → Node.js → Restart

### Problem: "API returns 404"
**Fix:** 
1. Check Node.js app is Running (hPanel)
2. Verify .htaccess port number is correct
3. Test via SSH: `curl http://localhost:3000/api/health`

### Problem: "Blank page"
**Fix:** 
1. Press F12 → Console
2. Check for errors
3. Verify all frontend files uploaded
4. Clear browser cache (Ctrl+Shift+R)

### Problem: "App won't start"
**Fix:** Check logs:
```bash
cd ~/app-backend
npm install --production  # Reinstall
node server.js  # See error
```

---

## 📚 DETAILED GUIDES

- **Complete Guide:** `HOSTINGER_DEPLOYMENT_GUIDE.md`
- **Full Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Troubleshooting:** See guide Phase 10

---

## 🎉 SUCCESS!

**You've deployed your classroom management system!**

Next steps:
1. ✅ Change admin password
2. ✅ Create teacher accounts
3. ✅ Create student accounts
4. ✅ Configure email settings
5. ✅ Enable backups (hPanel → Backups)

---

**Deployment Platform:** Hostinger Business Hosting  
**Estimated Time:** 2 hours  
**Status:** Production Ready ✨
