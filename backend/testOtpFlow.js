/**
 * Test OTP Generation and Verification
 * This script helps test the OTP 2FA system
 */

require('dotenv').config();
const db = require('./config/db');
const otpService = require('./services/otpService');

async function testOTPFlow() {
  try {
    console.log('🧪 Testing OTP 2FA Flow\n');

    // Generate a fresh OTP
    console.log('Step 1: Generating OTP for otptest@example.com');
    const otp = otpService.generateOTP();
    console.log(`Generated OTP: ${otp}\n`);

    // Hash it
    const hashedOTP = otpService.hashOTP(otp);
    console.log(`Hashed OTP: ${hashedOTP}\n`);

    // Store it
    console.log('Step 2: Storing OTP in database');
    const expiryTime = new Date(Date.now() + 10 * 60000);
    const connection = db.promise();
    await connection.execute(
      'UPDATE users SET otp_code = ?, otp_expiry = ?, otp_attempts = 0 WHERE email = ?',
      [hashedOTP, expiryTime, 'otptest@example.com']
    );
    console.log('✅ OTP stored\n');

    // Verify the OTP
    console.log('Step 3: Verifying OTP');
    const isValid = otpService.verifyOTP(otp, hashedOTP);
    console.log(`OTP is valid: ${isValid}\n`);

    // Test with wrong OTP
    console.log('Step 4: Testing with wrong OTP');
    const wrongOTP = '000000';
    try {
      const isWrongValid = otpService.verifyOTP(wrongOTP, hashedOTP);
      console.log(`Wrong OTP is valid: ${isWrongValid}\n`);
    } catch (error) {
      console.log('Wrong OTP correctly rejected\n');
    }

    console.log('✅ OTP Test Summary:');
    console.log('===================');
    console.log(`Correct OTP: ${otp}`);
    console.log(`Expiry Time: ${expiryTime.toISOString()}`);
    console.log(`Use this OTP to test the /api/auth/verify-otp endpoint`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

testOTPFlow();
