-- Add OTP fields to users table for 2FA support
-- Run this migration to enable OTP-based two-factor authentication

ALTER TABLE users
ADD COLUMN otp_code VARCHAR(255) NULL COMMENT 'Hashed OTP code for 2FA',
ADD COLUMN otp_expiry DATETIME NULL COMMENT 'OTP expiration time (10 minutes)',
ADD COLUMN otp_attempts INT DEFAULT 0 COMMENT 'Failed OTP attempts counter',
ADD COLUMN otp_locked_until DATETIME NULL COMMENT 'Account locked until time (after 5 failed attempts)';

-- Create index for faster OTP lookups
CREATE INDEX idx_otp_email ON users(email) WHERE otp_code IS NOT NULL;

-- Verify the columns were added
-- SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'users' AND COLUMN_NAME IN ('otp_code', 'otp_expiry', 'otp_attempts', 'otp_locked_until');
