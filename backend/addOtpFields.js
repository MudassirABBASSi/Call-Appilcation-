/**
 * Run OTP Migration
 * Adds OTP fields to users table for 2FA support
 * 
 * Usage: node addOtpFields.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function runMigration() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting OTP migration...\n');

    // Add OTP columns (ignore errors if they already exist)
    const columns = [
      {
        name: 'otp_code',
        sql: `ALTER TABLE users ADD COLUMN otp_code VARCHAR(255) NULL COMMENT 'Hashed OTP code for 2FA'`
      },
      {
        name: 'otp_expiry',
        sql: `ALTER TABLE users ADD COLUMN otp_expiry DATETIME NULL COMMENT 'OTP expiration time (10 minutes)'`
      },
      {
        name: 'otp_attempts',
        sql: `ALTER TABLE users ADD COLUMN otp_attempts INT DEFAULT 0 COMMENT 'Failed OTP attempts counter'`
      },
      {
        name: 'otp_locked_until',
        sql: `ALTER TABLE users ADD COLUMN otp_locked_until DATETIME NULL COMMENT 'Account locked until time (after 5 failed attempts)'`
      }
    ];

    for (const col of columns) {
      try {
        console.log(`📝 Adding ${col.name} column...`);
        await connection.execute(col.sql);
        console.log(`✅ ${col.name} column added\n`);
      } catch (error) {
        // Check if error is "column already exists"
        if (error.message.includes('Duplicate column name')) {
          console.log(`ℹ️  ${col.name} column already exists\n`);
        } else {
          throw error;
        }
      }
    }

    // Verify columns
    console.log('🔍 Verifying migration...');
    const [columnsResult] = await connection.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME IN ('otp_code', 'otp_expiry', 'otp_attempts', 'otp_locked_until')
      ORDER BY ORDINAL_POSITION
    `);

    if (columnsResult.length > 0) {
      console.log('\n✅ OTP columns verified:\n');
      columnsResult.forEach(col => {
        console.log(`   • ${col.COLUMN_NAME} (${col.COLUMN_TYPE}) - Nullable: ${col.IS_NULLABLE}`);
      });
      console.log('\n✅ OTP migration completed successfully!');
      console.log(`   Found ${columnsResult.length}/4 OTP columns`);
    } else {
      console.log('⚠️  Warning: No OTP columns found after migration');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.release();
    await pool.end();
  }
}

// Run migration
runMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
