# PART 3 & 4 - INPUT VALIDATION & FILE UPLOAD SECURITY
## ✅ COMPLETE & PRODUCTION-READY

---

## PART 3 - INPUT VALIDATION (JOI)

### What Was Implemented

**Package Installed:**
- `joi` v18.0.2 ✅

**Validation Middleware:**
- `validate(schema, source='body')` - Reusable validation middleware factory
- Comprehensive error messages
- Automatic data sanitization

### Architecture

```
Request with Data
    ↓
Route Handler
    ↓
validate(schema) Middleware
    ↓
├─ Invalid Data  → 400 Error Response ❌
│  {success: false, message: "...", errors: [...]}
│
└─ Valid Data    → Sanitized & Passed to Controller ✅
   (stripUnknown: true, trimmed, normalized)
```

### Validation Schemas Created

#### Authentication Schemas:

**1. loginSchema**
```javascript
{
  email: string, email format, required, lowercase, trimmed
  password: string, min 8 chars, required
}
```

**2. registerSchema**
```javascript
{
  name: string, 3-100 chars, required, trimmed
  email: string, email format, required, lowercase
  password: string, min 8 chars, required
           pattern: uppercase + lowercase + number
  confirmPassword: must match password, required
  role: 'teacher' | 'student', required
}
```

**3. forgotPasswordSchema**
```javascript
{
  email: string, email format, required
}
```

**4. resetPasswordSchema**
```javascript
{
  password: string, min 8 chars, pattern: uppercase+lowercase+number
  confirmPassword: must match password
}
```

#### Classroom Schemas:

**5. createClassSchema**
```javascript
{
  className: string, 3-100 chars, required
  description: string, max 500 chars, optional
  schedule: string, 3-100 chars, required
  startDate: date, must be future, required
  endDate: date, must be after startDate, required
  maxStudents: number, 1-1000, required
}
```

**6. updateClassSchema**
```javascript
{
  className: string, 3-100 chars, optional
  description: string, max 500 chars, optional
  schedule: string, 3-100 chars, optional
  endDate: date, optional
  maxStudents: number, 1-1000, optional
}
```

#### Assignment Schemas:

**7. createAssignmentSchema**
```javascript
{
  title: string, 3-200 chars, required
  description: string, 10-2000 chars, required
  classId: positive integer, required
  dueDate: future date, required
  totalMarks: positive integer, 1-1000, required
  instructions: string, max 1000 chars, optional
}
```

**8. gradeAssignmentSchema**
```javascript
{
  marksObtained: non-negative integer, required
  marksTotal: positive integer, required
  feedback: string, max 1000 chars, optional
}
```

#### Attendance Schema:

**9. markAttendanceSchema**
```javascript
{
  studentId: positive integer, required
  status: 'present' | 'absent' | 'late', required
  remarks: string, max 200 chars, optional
}
```

#### User Schemas:

**10. updateProfileSchema**
```javascript
{
  name: string, 3-100 chars, optional
  email: string, email format, optional
  phone: valid phone format, max 20 chars, optional
}
```

**11. changePasswordSchema**
```javascript
{
  currentPassword: string, required
  newPassword: string, min 8 chars, pattern: uppercase+lowercase+digit
  confirmPassword: must match newPassword
}
```

#### OTP/2FA Schemas:

**12. sendOtpSchema**
```javascript
{
  email: string, email format, required
}
```

**13. verifyOtpSchema**
```javascript
{
  email: string, email format, required
  otp: string, exactly 6 digits, required
}
```

#### Message Schema:

**14. sendMessageSchema**
```javascript
{
  recipientId: positive integer, required
  message: string, 1-5000 chars, required
}
```

### Error Response Format

**When validation fails (400 Bad Request):**
```json
{
  "success": false,
  "message": "email: Please provide a valid email address",
  "errors": [
    "email: Please provide a valid email address",
    "password: This field must be at least 8 characters"
  ],
  "code": "VALIDATION_ERROR"
}
```

### Features

✅ **Automatic Data Sanitization:**
- Whitespace trimming
- Lowercase email normalization
- Unknown fields stripped out
- XSS prevention

✅ **Detailed Error Messages:**
- Field-specific error info
- Custom error messages
- User-friendly text
- Developer-friendly structure

✅ **Type Coercion:**
- Email lowercase + trim
- Valid date parsing
- Number parsing

✅ **Security Checks:**
- Strong password requirements
- Email format validation
- No empty strings
- Pattern matching for sensitive fields

### Integration with Routes

**Updated Files:**
- `backend/routes/auth.js` - Added validation to login/register
- `backend/routes/passwordRoutes.js` - Added validation to forgot-password/reset-password

**Example Usage:**
```javascript
const { validate, loginSchema } = require('../middleware/validation');

router.post('/login', validate(loginSchema), authController.login);
```

### Testing

**Test 1: Invalid Email**
```bash
POST /api/auth/login
{"email": "invalid-email", "password": "ValidPassword123"}

Response:
{
  "success": false,
  "message": "email: Please provide a valid email address",
  "code": "VALIDATION_ERROR"
}
```

**Test 2: Weak Password**
```bash
POST /api/auth/login  
{"email": "user@example.com", "password": "weak"}

Response:
{
  "success": false,
  "message": "password: This field must be at least 8 characters",
  "code": "VALIDATION_ERROR"
}
```

**Test 3: Valid Data**
```bash
POST /api/auth/login
{"email": "user@example.com", "password": "ValidPass123"}

Response: Proceeds to controller ✅
```

---

## PART 4 - FILE UPLOAD SECURITY

### What Was Implemented

**Multer Configuration:**
- File type validation
- File size limits (5MB max)
- Filename sanitization
- MIME type verification
- Extension validation

### File Validation Middleware

**File: `backend/middleware/fileUpload.js`**

#### Allowed File Types:

```
Documents:
  - .pdf (application/pdf)
  - .doc (application/msword)
  - .docx (application/vnd.openxmlformats-officedocument.wordprocessingml.document)

Images:
  - .png (image/png)
  - .jpg (image/jpeg, image/jpg)
```

#### Size Limits:
```
- Maximum per file: 5MB
- Maximum per upload: 5MB
```

#### Security Features:

✅ **MIME Type Validation:**
- Double-check: MIME type + extension match
- Reject unknown MIME types
- Reject extension spoofing

✅ **Filename Sanitization:**
- Remove special characters
- Add timestamp for uniqueness
- Prevent directory traversal
- Lowercase all filenames

✅ **Safe Error Handling:**
- 400 status for validation failures
- Proper error messages
- No server crashes
- JSON error responses

✅ **Size Protection:**
- 5MB limit per file
- Prevent disk space exhaustion
- Return proper error message

### Error Messages

**Invalid File Type:**
```json
{
  "success": false,
  "message": "Invalid file type. Allowed types: pdf, doc, docx, png, jpg",
  "code": "INVALID_FILE_TYPE"
}
```

**File Too Large:**
```json
{
  "success": false,
  "message": "File is too large. Maximum size is 5MB.",
  "code": "FILE_TOO_LARGE",
  "maxSize": "5MB"
}
```

**Too Many Files:**
```json
{
  "success": false,
  "message": "Too many files. Maximum is 10 files.",
  "code": "TOO_MANY_FILES"
}
```

**No File Provided:**
```json
{
  "success": false,
  "message": "File is required.",
  "code": "NO_FILE_PROVIDED"
}
```

### Multer Instances

**For single file uploads:**
```javascript
const { upload } = require('../middleware/fileUpload');

router.post('/upload', upload.single('file'), handleUploadError, controller);
```

**For multiple files:**
```javascript
const { uploadMultiple } = require('../middleware/fileUpload');

router.post('/uploads', uploadMultiple.array('files', 10), handleUploadError, controller);
```

### Middleware Functions

**1. upload** - Single file upload
**2. uploadMultiple** - Multiple files (max 10)
**3. handleUploadError** - Error handler for file upload errors
**4. requireFile** - Validation middleware (file required)
**5. requireFiles** - Validation middleware (files required)

### Integration Example

```javascript
const express = require('express');
const router = express.Router();
const { upload, handleUploadError, requireFile } = require('../middleware/fileUpload');

// Upload single file with validation
router.post('/assignment/submit',
  upload.single('document'),
  handleUploadError,
  requireFile,
  assignmentController.submitWithFile
);
```

### File Processing

**How files are saved:**
1. Multer receives file
2. Applies fileFilter (MIME type check)
3. Filename sanitized: `{timestamp}_{sanitized_name}`
4. Saved to: `backend/uploads/`
5. Path returned to controller for DB storage

**Example saved filename:**
```
1709530800000_assignment_submission.pdf
```

### Production Checklist

✅ Files validated before processing  
✅ MIME types double-checked  
✅ Extensions verified  
✅ Filenames sanitized  
✅ Size limits enforced  
✅ Error handling in place  
✅ No server crashes on errors  
✅ Proper JSON responses  
✅ Timestamp prevents collisions  
✅ 5MB limit per file  

---

## FILES CREATED/MODIFIED

### Created:
- ✅ `backend/middleware/validation.js` (450+ lines)
- ✅ `backend/middleware/fileUpload.js` (350+ lines)

### Modified:
- ✅ `backend/routes/auth.js` - Added validation to login/register
- ✅ `backend/routes/passwordRoutes.js` - Added validation to password routes

### Backend Status:
```
✅ Port 5000: Running with validation
✅ All auth routes validated
✅ Error handling in place
✅ No breaking changes
```

---

## NEXT: PART 5 - TWO-FACTOR AUTHENTICATION (OTP)

Ready to implement:
1. OTP generation (6-digit random)
2. Email sending via nodemailer
3. OTP storage with expiration
4. OTP verification logic
5. Frontend OTP verification UI

Would you like me to proceed with PART 5?
