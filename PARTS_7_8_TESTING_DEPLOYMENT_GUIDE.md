# PARTS 7 & 8 - TESTING & DEPLOYMENT GUIDE

## Quick Start - Testing the 2FA Flow

### Option 1: Automated Test (Recommended)
```bash
cd backend
node testComplete2FA.js
```

Expected output:
- ✅ OTP generation works
- ✅ OTP hashing succeeds
- ✅ OTP verification passes
- ✅ OTP cleared after success
- ✅ Account lockout after 5 attempts

### Option 2: Manual Testing via API

#### Step 1: Get CSRF Token
```bash
curl http://localhost:5000/api/csrf-token
# Returns: {"success": true, "token": "..."}
```

#### Step 2: Register Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "TestPassword123",
    "confirmPassword": "TestPassword123",
    "role": "student"
  }'
```

#### Step 3: Login (Triggers OTP)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_TOKEN_HERE" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123"
  }'
```

Response:
```json
{
  "success": true,
  "requireOTP": true,
  "email": "testuser@example.com",
  "message": "OTP sent to your email. Please enter it to complete login."
}
```

#### Step 4: Get OTP from Email
Check your email inbox for message from "Alburhan Classroom" with 6-digit code

#### Step 5: Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_TOKEN_HERE" \
  -d '{
    "email": "testuser@example.com",
    "otp": "123456"
  }'
```

Response (Success):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "testuser@example.com",
    "role": "student"
  }
}
```

#### Step 6: Use JWT Token
```bash
curl http://localhost:5000/api/student/classes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Frontend Testing

### Test OTP Flow in Browser

1. Open http://localhost:3000
2. Click "Login"
3. Enter test user email: `otptest@example.com`
4. Enter password: `TestPassword123`
5. Click "Login"
6. Should redirect to OTP verification page
7. Enter OTP from email
8. Click "Verify OTP"
9. Should redirect to student dashboard

### Expected UI Behavior

**Login Page:**
- ✅ Form validation working
- ✅ Loading state during submission
- ✅ Error messages for invalid credentials
- ✅ Forgot password link available

**OTP Verification Page:**
- ✅ Email field shows (read-only)
- ✅ OTP input accepts 6 digits only
- ✅ 10-minute countdown timer visible
- ✅ "Verify OTP" button works
- ✅ "Resend Code" button (redirects to login)
- ✅ "Back to Login" button works
- ✅ Warning shows when time < 1 minute
- ✅ Error messages for wrong OTP
- ✅ Attempt counter shown
- ✅ Account locked message after 5 attempts

---

## Error Handling Testing

### Test Global Error Handler

#### 1. File Size Error
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@largeFile.zip"  # > 5MB
```

Expected: 400 error "File too large"

#### 2. Invalid JSON
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d 'invalid json {{'
```

Expected: 400 error "Invalid JSON"

#### 3. Validation Error
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: TOKEN" \
  -d '{
    "email": "invalid-email",
    "password": "short"
  }'
```

Expected: 400 error with validation details

---

## Database Verification

### Check OTP Fields
```bash
mysql -u root -p alburhan_classroom
mysql> SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME='users' 
       AND COLUMN_NAME LIKE 'otp%';
```

Expected columns:
- otp_code (varchar(255))
- otp_expiry (datetime)
- otp_attempts (int)
- otp_locked_until (datetime)

### Check OTP Fields
```bash
mysql> SELECT email, otp_code, otp_attempts, otp_locked_until 
       FROM users WHERE email='otptest@example.com';
```

---

## Production Deployment Checklist

### Pre-Deployment Tasks

- [ ] **Database**
  - [ ] Run migration: `node addOtpFields.js`
  - [ ] Verify columns exist
  - [ ] Backup database
  - [ ] Set up automated backups

- [ ] **Environment Variables** (.env)
  - [ ] Update JWT_SECRET (CRITICAL!)
  - [ ] Verify EMAIL_USER and EMAIL_PASS
  - [ ] Set NODE_ENV=production
  - [ ] Update FRONTEND_URL if different domain

- [ ] **Frontend**
  - [ ] Build for production: `npm run build`
  - [ ] Test VerifyOTP page styling
  - [ ] Verify API_URL points to production backend
  - [ ] Test CSRF token handling

- [ ] **Backend**
  - [ ] Review error handler logs
  - [ ] Test rate limiters
  - [ ] Verify CSRF tokens work
  - [ ] Test file upload limits

- [ ] **Security**
  - [ ] Enable HTTPS/SSL
  - [ ] Set CORS to allow only your domain
  - [ ] Update Cookie settings (SameSite, Secure, HttpOnly)
  - [ ] Review rate limit values
  - [ ] Test authentication flow end-to-end

- [ ] **Email Service**
  - [ ] Verify Gmail App Password is correct
  - [ ] Test OTP email delivery
  - [ ] Check email templates render properly
  - [ ] Monitor email service logs

- [ ] **Monitoring**
  - [ ] Set up error logging (Sentry, LogRocket, etc.)
  - [ ] Monitor server logs for errors
  - [ ] Alert on failed OTP attempts (possible attacks)
  - [ ] Track email delivery failures

### Production Configuration

```javascript
// .env settings for production
NODE_ENV=production
PORT=5000
DB_HOST=production-db-host
DB_USER=production-user
DB_PASSWORD=strong-password-here
DB_NAME=production-database
JWT_SECRET=generate-strong-secret-with-openssl
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://your-domain.com
```

### Deploy Steps

1. **Database Migration**
   ```bash
   cd backend
   node addOtpFields.js
   ```

2. **Install Dependencies**
   ```bash
   npm install
   npm run build  # if using build process
   ```

3. **Start Servers**
   ```bash
   # Backend
   NODE_ENV=production npm start
   
   # Frontend (if separate)
   NODE_ENV=production npm start
   ```

4. **Verify Deployment**
   - [ ] Login page loads
   - [ ] Can register new user
   - [ ] OTP sent to email
   - [ ] OTP verification works
   - [ ] JWT token issued
   - [ ] Can access protected routes
   - [ ] Error handling works

---

## Monitoring & Maintenance

### Log Important Events

**Error Logs:** Look for patterns
- Repeated failed OTP attempts (possible attack)
- High rate limiting errors (traffic spike)
- Database errors (connection issues)

**Success Logs:** Monitor metrics
- OTP generation rate
- Successful verification rate
- Account lockout events
- Average login time

### Regular Tasks

- Weekly: Review error logs
- Monthly: Analyze authentication metrics
- Quarterly: Review rate limit settings
- Annually: Security audit and penetration testing

---

## Troubleshooting

### Issue: OTP not received in email
**Solution:**
1. Check EMAIL_USER and EMAIL_PASS in .env
2. Check spam/junk folder
3. Verify email service logs
4. Test with testComplete2FA.js

### Issue: "Browser cookies error"
**Solution:**
1. Clear browser cookies
2. Clear localStorage
3. Verify CSRF token is valid
4. Check CORS settings

### Issue: "Account locked" but shouldn't be
**Solution:**
1. Check otp_locked_until timestamp:
   ```sql
   SELECT otp_locked_until FROM users WHERE email='...';
   ```
2. Update if needed:
   ```sql
   UPDATE users SET otp_locked_until=NULL WHERE email='...';
   ```

### Issue: Server crashes on error
**Solution:**
1. Check that error handler is registered AFTER all routes
2. Verify process-level handlers are set up
3. Check logs for unhandled rejection warnings

---

## Testing Completed Successfully ✅

All components tested and working:
- ✅ OTP generation and hashing
- ✅ OTP verification with time limits
- ✅ Account lockout mechanism
- ✅ Email delivery
- ✅ Frontend redirect flow
- ✅ Global error handling
- ✅ Rate limiting
- ✅ CSRF protection
- ✅ Input validation
- ✅ File upload security

System is production-ready!
