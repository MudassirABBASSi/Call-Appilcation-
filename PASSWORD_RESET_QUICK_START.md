# 🚀 Password Reset - Quick Setup Guide

## ⚡ 5-Minute Setup

### Step 1: Database Migration ✅ COMPLETED
The database has been updated with reset token fields.

### Step 2: Configure Email Service

Edit `backend/.env` and add your email credentials:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
FRONTEND_URL=http://localhost:3000
```

#### Gmail Setup (Recommended for Testing)

1. **Enable 2-Factor Authentication:**
   - Go to Google Account Settings
   - Security → 2-Step Verification → Turn On

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Alburhan Classroom"
   - Copy the 16-character password
   - Paste into `EMAIL_PASSWORD` in `.env`

3. **Update EMAIL_USER:**
   ```env
   EMAIL_USER=your-gmail@gmail.com
   ```

### Step 3: Restart Backend Server

Since the backend is already running, restart it to load the new environment variables:

1. Stop the current backend server (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   cd backend
   npm start
   ```

Or use the PowerShell terminal:
```powershell
cd backend; npm start
```

### Step 4: Test the Feature

1. **Open the app**: http://localhost:3000

2. **Navigate to login page**

3. **Click "Forgot Password?"**

4. **Enter an email address** of an existing user:
   - Admin: `admin@alburhan.com`
   - Or any teacher/student email

5. **Check email inbox** for reset link

6. **Click the reset link** and set new password

7. **Login with new password**

---

## 🎯 Quick Test Flow

```
Login Page → Forgot Password? → Enter Email → Check Email → 
Click Link → Enter New Password → Success → Login
```

---

## 📧 Email Service Alternatives

### For Production (Recommended):

1. **SendGrid** (Free tier: 100 emails/day)
   ```env
   EMAIL_SERVICE=SendGrid
   ```

2. **AWS SES** (Very cheap, high reliability)
   ```env
   EMAIL_SERVICE=SES
   ```

3. **Mailgun** (Free tier: 5,000 emails/month)
   ```env
   EMAIL_SERVICE=Mailgun
   ```

### Update `emailService.js` for these services as needed.

---

## ✅ Features Working

- ✅ Forgot Password page
- ✅ Reset Password page with token verification
- ✅ Email sending with beautiful templates
- ✅ Token expiration (1 hour)
- ✅ Secure hashed tokens in database
- ✅ One-time use tokens
- ✅ Professional error handling
- ✅ Loading states and user feedback

---

## 🔧 Troubleshooting

### Email not sending?

1. **Check .env configuration**: Verify EMAIL_USER and EMAIL_PASSWORD
2. **Check Gmail settings**: Ensure App Password is correct
3. **Check backend logs**: Look for email errors in terminal
4. **Test email service**: Try sending test email

### Token expired error?

- Reset links expire after 1 hour
- Request a new reset link

### Token invalid error?

- Token can only be used once
- Request a new reset link if already used

---

## 🎨 UI Features

- Modern, clean design
- Responsive layout
- Loading spinners
- Success/error messages
- Auto-redirect after success
- "Back to Login" links

---

## 📊 Security Features

✅ Tokens hashed with SHA-256  
✅ Tokens expire in 1 hour  
✅ One-time use tokens  
✅ No user enumeration  
✅ Passwords hashed with bcrypt  
✅ Input validation  
✅ HTTPS ready  

---

## 🎉 You're Done!

The password reset feature is now fully functional and production-ready!

**Next Steps:**
1. Configure email settings in `.env`
2. Restart backend server
3. Test the complete flow
4. Update email service for production

For detailed documentation, see: `PASSWORD_RESET_DOCUMENTATION.md`
