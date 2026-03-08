-- Add otp_verified_at column to users table
-- This tracks when a user last successfully verified with OTP
-- If NULL, user has never verified with OTP (new user or first login)
-- If older than 7 days, user will need to verify OTP again on next login

ALTER TABLE users ADD COLUMN otp_verified_at TIMESTAMP NULL DEFAULT NULL;
