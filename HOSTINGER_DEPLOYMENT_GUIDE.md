# 🚀 HOSTINGER DEPLOYMENT GUIDE - Alburhan Classroom

## Complete Step-by-Step Deployment to Hostinger Business Hosting

---

## 📋 PREREQUISITES CHECKLIST

Before starting, ensure you have:
- ✅ Hostinger Business Web Hosting account
- ✅ Domain: `alburhanacademy.com`
- ✅ Subdomain created: `app.alburhanacademy.com`
- ✅ Access to Hostinger hPanel
- ✅ FTP/SFTP credentials (from hPanel)
- ✅ FileZilla or any FTP client installed
- ✅ Your application code ready

---

## 🎯 DEPLOYMENT ARCHITECTURE

```
app.alburhanacademy.com
├── Node.js Backend (API) → /home/username/app-backend/
│   ├── Runs on port configured by Hostinger
│   ├── Handles: /api/* routes
│   └── MySQL database connection
│
└── React Frontend (Static) → /public_html/app.alburhanacademy.com/
    ├── Build files (index.html, assets, etc.)
    └── Proxies API calls to backend
```

---

## PHASE 1: PREPARE YOUR LOCAL APPLICATION (20 minutes)

### Step 1.1: Update Backend Configuration

1. **Copy the production environment file:**
   ```powershell
   Copy-Item backend\.env.production backend\.env.production.example
   ```

2. **Edit `backend/.env.production`** with your actual values:
   - Database credentials (from Hostinger)
   - JWT secret (generate a strong random string)
   - Email credentials (for notifications)
   - Frontend URL: `https://app.alburhanacademy.com`

### Step 1.2: Update Frontend Configuration

1. **Edit `frontend/.env.production`:**
   ```env
   REACT_APP_API_URL=https://app.alburhanacademy.com/api
   ```

2. **Create frontend API configuration file:**
   
   Create/update `frontend/src/config/api.js`:
   ```javascript
   const API_BASE_URL = process.env.REACT_APP_API_URL || 
                        (process.env.NODE_ENV === 'production' 
                          ? 'https://app.alburhanacademy.com/api'
                          : 'http://localhost:5000/api');

   export default API_BASE_URL;
   ```

### Step 1.3: Update Backend CORS Configuration

Edit `backend/server.js` - update CORS to allow your subdomain:
```javascript
app.use(cors({
  origin: [
    'https://app.alburhanacademy.com',
    'https://alburhanacademy.com',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));
```

### Step 1.4: Add Production-Ready Scripts

Add to `backend/package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "production": "NODE_ENV=production node server.js"
  }
}
```

---

## PHASE 2: BUILD THE APPLICATION (10 minutes)

### Step 2.1: Build React Frontend

```powershell
cd frontend
npm install
npm run build
```

✅ **Result:** Creates `frontend/build/` folder with optimized static files

### Step 2.2: Prepare Backend Files

```powershell
cd backend
npm install --production
```

✅ **Result:** Installs only production dependencies (no devDependencies)

### Step 2.3: Create Deployment Package

Create a folder structure:
```
deployment-package/
├── backend/
│   ├── All backend files EXCEPT node_modules
│   ├── package.json
│   ├── package-lock.json
│   └── .env.production (rename to .env on server)
│
└── frontend-build/
    └── All files from frontend/build/
```

---

## PHASE 3: HOSTINGER SETUP (30 minutes)

### Step 3.1: Create MySQL Database in hPanel

1. **Login to Hostinger hPanel**
2. Go to **Databases** → **MySQL Databases**
3. Click **"Create New Database"**
   - Database Name: `alburhan_classroom`
   - Username: Create a new user (e.g., `alburhan_user`)
   - Password: Generate strong password
   - Grant **ALL PRIVILEGES**
4. **Save these credentials** - you'll need them for `.env` file

5. **Import Database Schema:**
   - Go to **phpMyAdmin** (in hPanel)
   - Select `alburhan_classroom` database
   - Click **Import** tab
   - Upload your SQL file: `backend/database/schema.sql`
   - Click **Go**

### Step 3.2: Create Subdomain

1. In hPanel, go to **Domains** → **Subdomains**
2. Click **"Create Subdomain"**
   - Subdomain: `app`
   - Domain: `alburhanacademy.com`
   - Document Root: `/public_html/app.alburhanacademy.com`
3. Click **Create**

✅ Wait 5-10 minutes for DNS propagation

### Step 3.3: Set Up Node.js Application

1. In hPanel, go to **Advanced** → **Node.js**
2. Click **"Setup New Application"**
   - **Application Mode:** Production
   - **Application Root:** `/home/your-username/app-backend`
   - **Application URL:** `app.alburhanacademy.com` (or use /api path)
   - **Application Startup File:** `server.js`
   - **Node.js Version:** Select latest (18.x or 20.x)
3. Click **Create**

**IMPORTANT:** Note the port number assigned by Hostinger (e.g., 3000, 4000, etc.)

### Step 3.4: Configure SSL Certificate

1. In hPanel, go to **Security** → **SSL**
2. Find `app.alburhanacademy.com`
3. Click **Install SSL**
4. Choose **Free SSL (Let's Encrypt)**
5. Wait for installation (2-5 minutes)

✅ Your subdomain now has HTTPS

---

## PHASE 4: UPLOAD FILES (30 minutes)

### Step 4.1: Connect via FTP/SFTP

1. **Get FTP credentials from hPanel:**
   - Go to **Files** → **FTP Accounts**
   - Use main account or create new one

2. **Open FileZilla (or your FTP client):**
   - Host: `ftp.alburhanacademy.com` (or IP from hPanel)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (FTP) or 22 (SFTP)

### Step 4.2: Upload Backend Files

1. **Navigate to:** `/home/your-username/app-backend/`
2. **Upload all backend files:**
   - All `.js` files
   - `package.json`
   - `package-lock.json`
   - All folders: `config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `utils/`, etc.
   - **DO NOT upload `node_modules/`** (will install on server)

3. **Upload `.env` file:**
   - Rename `backend/.env.production` to `.env`
   - Upload to `/home/your-username/app-backend/.env`
   - **Edit on server** with correct database credentials

### Step 4.3: Upload Frontend Files

1. **Navigate to:** `/public_html/app.alburhanacademy.com/`
2. **Upload all files from `frontend/build/`:**
   - `index.html`
   - `static/` folder (CSS, JS files)
   - `manifest.json`
   - `favicon.ico`
   - All other build files

✅ Frontend is now accessible at `https://app.alburhanacademy.com`

---

## PHASE 5: INSTALL BACKEND DEPENDENCIES (15 minutes)

### Step 5.1: Access SSH Terminal

1. In hPanel, go to **Advanced** → **SSH Access**
2. Enable SSH if not already enabled
3. Get SSH credentials
4. Use **PuTTY** (Windows) or **Terminal** (Mac/Linux):
   ```bash
   ssh username@your-server-ip
   ```

### Step 5.2: Install Node Modules

```bash
# Navigate to backend directory
cd ~/app-backend

# Install dependencies
npm install --production

# Verify installation
npm list --depth=0
```

### Step 5.3: Set Up Environment Variables

```bash
# Edit .env file
nano .env

# Update these values:
# - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# - JWT_SECRET (generate strong random string)
# - EMAIL_USER, EMAIL_PASSWORD
# - FRONTEND_URL=https://app.alburhanacademy.com

# Save: Ctrl+O, Enter, Ctrl+X
```

---

## PHASE 6: CONFIGURE NODE.JS APPLICATION (15 minutes)

### Step 6.1: Update Application Settings in hPanel

1. Go to **Node.js** section in hPanel
2. Click **Edit** on your application
3. **Update settings:**
   - Application Root: `/home/username/app-backend`
   - Startup File: `server.js`
   - Node.js Version: Latest stable (18.x or 20.x)

### Step 6.2: Set Environment Variables in hPanel

1. In Node.js application settings
2. Find **"Environment Variables"** section
3. Add variables from your `.env` file:
   - `NODE_ENV=production`
   - `DB_HOST=localhost`
   - `DB_USER=alburhan_user`
   - `DB_PASSWORD=your_password`
   - `DB_NAME=alburhan_classroom`
   - `JWT_SECRET=your_secret`
   - `FRONTEND_URL=https://app.alburhanacademy.com`

### Step 6.3: Start the Application

1. Click **"Restart Application"** in hPanel Node.js section
2. Check **Application Status** - should show "Running"

---

## PHASE 7: CONFIGURE URL ROUTING (CRITICAL!) (20 minutes)

### Step 7.1: Create .htaccess for Frontend

Create `/public_html/app.alburhanacademy.com/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Proxy API requests to Node.js backend
  RewriteCond %{REQUEST_URI} ^/api/(.*)
  RewriteRule ^api/(.*)$ http://localhost:PORT_NUMBER/api/$1 [P,L]
  # ⚠️ Replace PORT_NUMBER with actual port from Node.js hPanel

  # Serve React app for all other routes
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>

# Enable CORS headers
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "https://app.alburhanacademy.com"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-CSRF-Token"
  Header set Access-Control-Allow-Credentials "true"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

**IMPORTANT:** Replace `PORT_NUMBER` with the actual port shown in Node.js hPanel

### Step 7.2: Update Backend server.js

Ensure backend trusts proxy (add at top of server.js):

```javascript
app.set('trust proxy', true);

// Add this before routes
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.path}`);
  next();
});
```

---

## PHASE 8: DATABASE INITIALIZATION (15 minutes)

### Step 8.1: Access phpMyAdmin

1. Go to hPanel → **Databases** → **phpMyAdmin**
2. Select `alburhan_classroom` database

### Step 8.2: Import Database Schema

1. Click **Import** tab
2. **Upload your SQL files in order:**
   - `backend/database/schema.sql` (main tables)
   - Any migration files
3. Click **Go** for each file

### Step 8.3: Create Initial Admin User

Run this SQL query in phpMyAdmin:

```sql
-- Create admin user (password: admin123 - CHANGE IMMEDIATELY!)
INSERT INTO users (email, password_hash, role, firstname, lastname, is_active) 
VALUES (
  'admin@alburhanacademy.com',
  '$2a$10$YourHashedPasswordHere',
  'admin',
  'Admin',
  'User',
  1
);
```

**Generate password hash via SSH:**
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
```

---

## PHASE 9: TESTING (20 minutes)

### Step 9.1: Test Frontend Access

1. Open browser: `https://app.alburhanacademy.com`
2. Should see login page
3. Check browser console (F12) for errors

### Step 9.2: Test Backend API

1. Test API directly:
   ```bash
   curl https://app.alburhanacademy.com/api/health
   ```
2. Should return:
   ```json
   {"status":"ok","message":"Server is running"}
   ```

### Step 9.3: Test Login

1. Try logging in with admin credentials
2. Check Network tab (F12) for API calls
3. Verify JWT token in cookies

### Step 9.4: Test All Features

- [ ] User login/logout
- [ ] Student dashboard
- [ ] Teacher dashboard
- [ ] Admin panel
- [ ] Assignment submission
- [ ] File uploads
- [ ] Notifications
- [ ] Messaging system
- [ ] Attendance tracking

---

## PHASE 10: OPTIMIZATION & SECURITY (15 minutes)

### Step 10.1: Enable Cloudflare (Optional but Recommended)

1. In Hostinger, go to **Domains** → **Cloudflare**
2. Enable for `alburhanacademy.com`
3. Set SSL to **Full (Strict)**
4. Enable:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - HTTP/2

### Step 10.2: Set Up Backups

1. In hPanel, go to **Backups**
2. Enable **Automatic Weekly Backups**
3. Create manual backup now

### Step 10.3: Monitor Application

1. Set up **Uptime Monitoring** in hPanel
2. Add email alerts for downtime
3. Monitor Node.js application logs:
   ```bash
   cd ~/app-backend
   tail -f logs/app.log
   ```

---

## 📝 POST-DEPLOYMENT CHECKLIST

- [ ] Application accessible at `https://app.alburhanacademy.com`
- [ ] SSL certificate installed and active (HTTPS working)
- [ ] Database connected successfully
- [ ] Admin login working
- [ ] All user roles (admin, teacher, student) functioning
- [ ] File uploads working
- [ ] Email notifications sending
- [ ] API endpoints responding correctly
- [ ] No console errors in browser
- [ ] Mobile responsive (test on phone)
- [ ] Changed default admin password
- [ ] Backups configured
- [ ] Monitoring enabled

---

## 🚨 TROUBLESHOOTING

### Issue: "Cannot connect to database"
**Solution:**
1. Check `.env` file has correct DB credentials
2. Verify database exists in phpMyAdmin
3. Check DB_HOST is `localhost` not `127.0.0.1`
4. Ensure MySQL user has proper privileges

### Issue: "API calls returning 404"
**Solution:**
1. Check Node.js app is running in hPanel
2. Verify `.htaccess` proxy rule has correct port
3. Check `REACT_APP_API_URL` in frontend `.env.production`
4. Test API directly: `https://app.alburhanacademy.com/api/health`

### Issue: "CORS errors"
**Solution:**
1. Update `backend/server.js` CORS config with correct domain
2. Add `Access-Control-Allow-Credentials: true`
3. Restart Node.js application

### Issue: "Frontend showing blank page"
**Solution:**
1. Check browser console for errors
2. Verify all build files uploaded correctly
3. Check `.htaccess` rewrite rules
4. Clear browser cache (Ctrl+Shift+R)

### Issue: "JWT token not working"
**Solution:**
1. Ensure `JWT_SECRET` same in `.env` and hPanel environment variables
2. Check cookie settings allow `secure: true` for HTTPS
3. Verify `SameSite` cookie attribute

### Issue: "File uploads failing"
**Solution:**
1. Create `uploads/` directory: `mkdir uploads` in backend
2. Set permissions: `chmod 755 uploads`
3. Check `MAX_FILE_SIZE` in `.env`
4. Verify Hostinger plan upload limits

---

## 🔧 MAINTENANCE

### Daily Checks
- Check Node.js app status in hPanel
- Monitor error logs

### Weekly Tasks
- Review backup status
- Check disk space usage
- Update npm packages (if needed)

### Monthly Tasks
- Database optimization
- Security audit
- SSL certificate renewal (automatic)

---

## 📞 SUPPORT RESOURCES

- **Hostinger Support:** 24/7 live chat in hPanel
- **Documentation:** https://support.hostinger.com
- **Community:** Hostinger community forums

---

## ✅ CONGRATULATIONS!

Your Alburhan Classroom is now live at:
### 🎓 https://app.alburhanacademy.com

---

**Created:** March 2026  
**Last Updated:** March 7, 2026  
**Status:** Production Ready ✨
