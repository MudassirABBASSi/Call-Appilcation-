-- Password Reset Feature Migration
-- Adds reset token fields to users table
-- Tokens are stored hashed for security
-- Tokens expire after 1 hour

ALTER TABLE users
ADD COLUMN reset_token VARCHAR(255) NULL,
ADD COLUMN reset_token_expiry DATETIME NULL;

-- Add index for faster token lookups
CREATE INDEX idx_reset_token ON users(reset_token);
