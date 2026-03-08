const db = require('./config/db');

console.log('Applying OTP verified_at migration...');

const query = 'ALTER TABLE users ADD COLUMN otp_verified_at TIMESTAMP NULL DEFAULT NULL;';

db.query(query, (err, result) => {
  if (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Column otp_verified_at already exists - migration already applied');
    } else {
      console.error('❌ Error applying migration:', err.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Successfully added otp_verified_at column to users table');
  }
  
  db.end();
  process.exit(0);
});
