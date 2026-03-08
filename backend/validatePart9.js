#!/usr/bin/env node

/**
 * PART 9 QUICK START VALIDATION SCRIPT
 * 
 * Run this script to verify all PART 9 security features are working
 * 
 * Usage: node validatePart9.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    log('green', `✅ ${description}`);
    return true;
  } else {
    log('red', `❌ ${description} - FILE NOT FOUND: ${filePath}`);
    return false;
  }
}

function checkFileContains(filePath, content, description) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    log('red', `❌ ${description} - FILE NOT FOUND`);
    return false;
  }
  
  const fileContent = fs.readFileSync(fullPath, 'utf8');
  if (fileContent.includes(content)) {
    log('green', `✅ ${description}`);
    return true;
  } else {
    log('red', `❌ ${description} - CONTENT NOT FOUND`);
    return false;
  }
}

async function runValidation() {
  log('cyan', '\n' + '='.repeat(60));
  log('cyan', 'PART 9 - IMPLEMENTATION VALIDATION');
  log('cyan', '='.repeat(60) + '\n');

  let passCount = 0;
  let totalCount = 0;

  // ============================================
  // BACKEND FILES VALIDATION
  // ============================================
  log('blue', '📦 BACKEND SECURITY MIDDLEWARE\n');

  totalCount++; // 1
  if (checkFile('backend/middleware/rateLimiter.js', 'Rate Limiter Middleware')) passCount++;

  totalCount++; // 2
  if (checkFile('backend/middleware/csrfMiddleware.js', 'CSRF Protection Middleware')) passCount++;

  totalCount++; // 3
  if (checkFile('backend/middleware/validation.js', 'Input Validation Schemas')) passCount++;

  totalCount++; // 4
  if (checkFile('backend/middleware/uploadConfig.js', 'File Upload Security')) passCount++;

  // ============================================
  // BACKEND SERVICES
  // ============================================
  log('blue', '\n🔐 BACKEND SECURITY SERVICES\n');

  totalCount++; // 5
  if (checkFile('backend/services/otpService.js', 'OTP Service Implementation')) passCount++;

  totalCount++; // 6
  if (checkFileContains('backend/services/emailService.js', 'sendOtpEmail', 'Email Service with OTP')) passCount++;

  // ============================================
  // BACKEND CONFIGURATION & CONTROLLERS
  // ============================================
  log('blue', '\n⚙️  BACKEND CONFIGURATION\n');

  totalCount++; // 7
  if (checkFileContains('backend/server.js', 'process.on(\'unhandledRejection\'', 'Process Error Handlers')) passCount++;

  totalCount++; // 8
  if (checkFileContains('backend/server.js', 'app.use((error, req, res, next)', 'Global Error Handler Middleware')) passCount++;

  totalCount++; // 9
  if (checkFileContains('backend/controllers/authController.js', 'async function verifyOtp', 'OTP Verification Controller')) passCount++;

  totalCount++; // 10
  if (checkFileContains('backend/routes/auth.js', '/verify-otp', 'OTP Verification Route')) passCount++;

  // ============================================
  // FRONTEND COMPONENTS
  // ============================================
  log('blue', '\n💻 FRONTEND OTP COMPONENT\n');

  totalCount++; // 11
  if (checkFile('frontend/src/pages/VerifyOTP.jsx', 'VerifyOTP Component')) passCount++;

  totalCount++; // 12
  if (checkFile('frontend/src/pages/VerifyOTP.css', 'VerifyOTP Styling')) passCount++;

  totalCount++; // 13
  if (checkFileContains('frontend/src/pages/Login.js', 'requireOTP', 'Login Component Updated')) passCount++;

  totalCount++; // 14
  if (checkFileContains('frontend/src/api/api.js', 'verifyOtp:', 'API Method for OTP')) passCount++;

  totalCount++; // 15
  if (checkFileContains('frontend/src/App.js', '/verify-otp', 'Frontend Route Added')) passCount++;

  // ============================================
  // DATABASE MIGRATION
  // ============================================
  log('blue', '\n💾 DATABASE SCHEMA\n');

  totalCount++; // 16
  if (checkFile('backend/migrations/addOtpFields.sql', 'OTP Fields Migration Script')) passCount++;

  // ============================================
  // TESTING FILES
  // ============================================
  log('blue', '\n🧪 TEST SUITE\n');

  totalCount++; // 17
  if (checkFile('backend/testPart9.js', 'Comprehensive Test Suite')) passCount++;

  // ============================================
  // DOCUMENTATION
  // ============================================
  log('blue', '\n📚 DOCUMENTATION\n');

  totalCount++; // 18
  if (checkFile('PART_9_COMPLETE_CODE_REFERENCE.md', 'Complete Code Reference')) passCount++;

  totalCount++; // 19
  if (checkFile('PART_9_TEST_EXECUTION_GUIDE.md', 'Test Execution Guide')) passCount++;

  totalCount++; // 20
  if (checkFile('PART_9_SECURITY_HARDENING_COMPLETE.md', 'Security Hardening Summary')) passCount++;

  // ============================================
  // CODE CONTENT VALIDATION
  // ============================================
  log('blue', '\n🔍 CODE IMPLEMENTATION DETAIL CHECKS\n');

  totalCount++; // 21
  if (checkFileContains('backend/middleware/rateLimiter.js', 'const authLimiter = rateLimit', 'Rate Limiter Implementation')) passCount++;

  totalCount++; // 22
  if (checkFileContains('backend/middleware/csrfMiddleware.js', 'const csrfProtection = csrf', 'CSRF Implementation')) passCount++;

  totalCount++; // 23
  if (checkFileContains('backend/middleware/validation.js', 'const validate = (schema)', 'Validation Middleware')) passCount++;

  totalCount++; // 24
  if (checkFileContains('backend/services/otpService.js', 'function hashOTP(otp)', 'OTP Hashing Function')) passCount++;

  totalCount++; // 25
  if (checkFileContains('backend/services/otpService.js', 'crypto.timingSafeEqual', 'Timing-Safe Comparison')) passCount++;

  totalCount++; // 26
  if (checkFileContains('backend/controllers/authController.js', 'if (response.data.requireOTP === true)', 'OTP Login Flow')) passCount++;

  totalCount++; // 27
  if (checkFileContains('backend/server.js', 'generalLimiter,', 'Rate Limiters Applied')) passCount++;

  totalCount++; // 28
  if (checkFileContains('backend/server.js', 'csrfProtection', 'CSRF Middleware Applied')) passCount++;

  totalCount++; // 29
  if (checkFileContains('frontend/src/pages/VerifyOTP.jsx', 'const [timeLeft, setTimeLeft]', 'Countdown Timer Implemented')) passCount++;

  totalCount++; // 30
  if (checkFileContains('frontend/src/pages/VerifyOTP.jsx', 'handleOtpChange', 'OTP Input Handler')) passCount++;

  // ============================================
  // SUMMARY
  // ============================================
  log('cyan', '\n' + '='.repeat(60));
  log('cyan', 'VALIDATION SUMMARY');
  log('cyan', '='.repeat(60) + '\n');

  if (passCount === totalCount) {
    log('green', `✅ ALL ${totalCount} CHECKS PASSED!`);
    log('green', '\n🎉 PART 9 is fully implemented and ready to test.\n');
    log('green', 'Next steps:');
    log('green', '1. Start backend: cd backend && npm start');
    log('green', '2. Start frontend: cd frontend && npm start');
    log('green', '3. Run tests: cd backend && node testPart9.js');
    return 0;
  } else {
    log('red', `❌ ${totalCount - passCount} checks failed`);
    log('red', `✅ Passed: ${passCount}/${totalCount}\n`);
    log('red', 'Please review failed items above and create missing files.');
    return 1;
  }
}

// Run validation
runValidation().then(code => process.exit(code));
