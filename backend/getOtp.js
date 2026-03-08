/**
 * Get OTP for testing
 */
const db = require('./config/db');

async function getOTP() {
  try {
    const query = 'SELECT email, otp_code, otp_attempts, otp_locked_until FROM users WHERE email = ?';
    const connection = db.promise();
    const [results] = await connection.execute(query, ['otptest@example.com']);
    
    if (results.length > 0) {
      console.log('OTP Information:');
      console.log('================');
      console.log('Email:', results[0].email);
      console.log('OTP Code (hashed):', results[0].otp_code);
      console.log('OTP Attempts:', results[0].otp_attempts);
      console.log('Locked Until:', results[0].otp_locked_until);
      console.log('\nNote: The OTP code is hashed with SHA256. You cannot reverse it.');
      console.log('The OTP should have been sent to the user\'s email.');
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

getOTP();
