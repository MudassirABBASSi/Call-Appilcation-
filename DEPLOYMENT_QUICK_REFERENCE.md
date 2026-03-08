# 📋 DEPLOYMENT QUICK REFERENCE CARD
## Print This and Keep It While Deploying!

---

## 🎯 YOUR GOAL
Make your app live at: **https://app.alburhanacademy.com**

---

## ✅ PHASE 1: PREPARE (30 min)

### Install Software:
- [ ] FileZilla: https://filezilla-project.org
- [ ] PuTTY: https://www.putty.org

### Get Credentials:
- [ ] Gmail App Password: https://myaccount.google.com/security
- [ ] Random JWT Secret: https://randomkeygen.com

### Update Config:
- [ ] Edit: `backend\.env.production`
  - EMAIL_USER=_________________
  - EMAIL_PASSWORD=_____________
  - JWT_SECRET=_________________

### Build Package:
```powershell
cd "d:\Video Call"
.\build-for-deployment.ps1
```
- [ ] Check folder created: `deployment-package/`

---

## ✅ PHASE 2: HOSTINGER SETUP (40 min)

### Login: https://hpanel.hostinger.com

### 1. Create Database (10 min)
- [ ] Databases → MySQL → Create New
  - Name: `alburhan_classroom`
  - User: `alburhan_user`
  - **SAVE PASSWORD:** _________________

### 2. Import Schema (5 min)
- [ ] phpMyAdmin → Import → `backend/database/schema.sql`

### 3. Update Config (5 min)
- [ ] Edit: `deployment-package/backend/.env`
  - DB_USER=alburhan_user
  - DB_PASSWORD=(paste your password)

### 4. Create Subdomain (5 min)
- [ ] Domains → Subdomains → Create
  - Subdomain: `app`
  - Domain: `alburhanacademy.com`

### 5. Enable SSL (5 min)
- [ ] Security → SSL → Install Free SSL

### 6. Setup Node.js (10 min)
- [ ] Advanced → Node.js → Setup New Application
  - Mode: Production
  - Root: `/home/USERNAME/app-backend`
  - File: `server.js`
  - **WRITE DOWN PORT:** _________

### 7. Update .htaccess
- [ ] Edit: `deployment-package/frontend-build/.htaccess`
  - Line 11: Replace PORT_NUMBER with _________

---

## ✅ PHASE 3: UPLOAD (30 min)

### FileZilla Connection:
- Host: ftp.alburhanacademy.com
- User: (from hPanel → FTP Accounts)
- Pass: _________________
- Port: 21

### Upload Backend:
- [ ] Local: `deployment-package/backend/`
- [ ] Remote: `/home/USERNAME/app-backend/`
- [ ] Drag & drop all files

### Upload Frontend:
- [ ] Local: `deployment-package/frontend-build/`
- [ ] Remote: `/public_html/app.alburhanacademy.com/`
- [ ] Drag & drop all files

---

## ✅ PHASE 4: INSTALL (20 min)

### PuTTY/SSH:
- Host: (from hPanel → SSH)
- Port: 22
- User: _________________
- Pass: _________________

### Commands:
```bash
cd app-backend
npm install --production
```
- [ ] Wait for completion (no errors)

---

## ✅ PHASE 5: START (10 min)

### Start App:
- [ ] hPanel → Node.js → Restart Application
- [ ] Status should show: **"Running"**

---

## ✅ PHASE 6: TEST (30 min)

### Test Frontend:
- [ ] Go to: https://app.alburhanacademy.com
- [ ] Should see login page

### Test API:
- [ ] Go to: https://app.alburhanacademy.com/api/health
- [ ] Should see: `{"status":"ok"}`

### Create Admin:
```bash
# In SSH:
cd ~/app-backend
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
```
- [ ] Copy the hash output
- [ ] phpMyAdmin → SQL:
```sql
INSERT INTO users (email, password_hash, role, firstname, lastname, is_active) 
VALUES ('admin@alburhanacademy.com', 'PASTE_HASH', 'admin', 'Admin', 'User', 1);
```

### Test Login:
- [ ] Login: admin@alburhanacademy.com / admin123
- [ ] Should see admin dashboard
- [ ] **Change password immediately!**

### Test Features:
- [ ] Create teacher
- [ ] Create student
- [ ] Create class
- [ ] Create assignment
- [ ] Test as teacher
- [ ] Test as student

---

## 🆘 EMERGENCY TROUBLESHOOTING

### Site not loading?
→ Wait 15 minutes (DNS), clear cache, check subdomain created

### 502 Error?
→ hPanel → Node.js → Restart Application

### Database error?
→ Check .env file DB credentials match hPanel

### Login fails?
→ F12 → Console, check API calls, test /api/health

### Can't upload files?
→ Check FTP credentials, try Passive mode in FileZilla

### npm install fails?
→ Check in correct folder (`pwd`), check package.json exists

---

## 📞 SUPPORT

**Hostinger 24/7 Support:**
- Live Chat in hPanel (bottom right)
- Email: support ticket in hPanel
- Say: "Deploying Node.js app, need help with..."

---

## ✨ SUCCESS = ALL GREEN!

- ✅ https://app.alburhanacademy.com loads
- ✅ Green padlock (HTTPS)
- ✅ Can login as admin
- ✅ Can create users
- ✅ All features work

**DEPLOYED! 🎉**

---

## 📝 NOTES & PASSWORDS

Write down your credentials (keep secure!):

**Hostinger:**
- Email: _______________________
- Password: ____________________

**FTP:**
- Host: _______________________
- User: _______________________
- Pass: _______________________

**SSH:**
- Host: _______________________
- User: _______________________
- Pass: _______________________

**Database:**
- Name: alburhan_classroom
- User: _______________________
- Pass: _______________________

**Node.js:**
- Port: _______________________

**Application:**
- Admin Email: admin@alburhanacademy.com
- Admin Pass: (change from admin123!)

---

**Print Date:** __________  
**Deployment Date:** __________  
**Status:** ⭕ Not Started / 🔄 In Progress / ✅ Complete
