/**
 * OTP Service - Email-based Two-Factor Authentication
 * Handles OTP generation, hashing, storage, and validation
 * 
 * Security Features:
 * - SHA256 hashing of OTP before storage
 * - 10-minute expiration time
 * - 5 maximum failed attempts per session
 * - 15-minute account lockout after exceeded attempts
 * - Crypto-secure random generation
 */

const crypto = require('crypto');
const db = require('../config/db');

const OTP_LENGTH = 6;                    // 6-digit OTP
const OTP_EXPIRY_MINUTES = 10;           // OTP valid for 10 minutes
const MAX_OTP_ATTEMPTS = 5;              // Max failed attempts before lockout
const LOCKOUT_DURATION_MINUTES = 15;     // Account lockout duration

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP (e.g., "123456")
 */
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

/**
 * Hash OTP using SHA256 for secure storage
 * @param {string} otp - Plain text OTP to hash
 * @returns {string} SHA256 hashed OTP (hex format)
 */
function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Verify provided OTP against stored hash
 * @param {string} providedOTP - Plain text OTP provided by user
 * @param {string} hashedOTP - SHA256 hashed OTP from database
 * @returns {boolean} True if OTP matches, false otherwise
 */
function verifyOTP(providedOTP, hashedOTP) {
  const hashedProvided = hashOTP(providedOTP);
  return crypto.timingSafeEqual(
    Buffer.from(hashedProvided),
    Buffer.from(hashedOTP)
  );
}

/**
 * Execute database query with promise support
 * @param {string} query - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise<array>} Query results
 */
async function executeQuery(query, params = []) {
  try {
    const connection = db.promise();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Generate OTP and send to user's email
 * Called after successful password verification during login
 */
async function generateAndSendOTP(email, emailService) {
  try {
    // Check if account is currently locked
    const lockCheck = await executeQuery(
      'SELECT otp_locked_until FROM users WHERE email = ?',
      [email]
    );

    if (lockCheck.length > 0 && lockCheck[0].otp_locked_until) {
      const lockedUntil = new Date(lockCheck[0].otp_locked_until);
      if (new Date() < lockedUntil) {
        const waitMinutes = Math.ceil((lockedUntil - new Date()) / 60000);
        return {
          success: false,
          message: `Account is locked. Try again in ${waitMinutes} minute(s).`,
          lockedUntil: lockedUntil.toISOString()
        };
      }
      await resetOTPAttempts(email);
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

    // Store OTP in database
    await executeQuery(
      `UPDATE users SET otp_code = ?, otp_expiry = ?, otp_attempts = 0 WHERE email = ?`,
      [hashedOTP, expiryTime, email]
    );

    // Send OTP via email
    const emailResult = await emailService(email, otp);

    if (!emailResult.success) {
      return {
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      };
    }

    return {
      success: true,
      message: `OTP sent to ${email}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
      expiryTime: expiryTime.toISOString()
    };
  } catch (error) {
    console.error('Error generating OTP:', error);
    return {
      success: false,
      message: 'Error generating OTP. Please try again.'
    };
  }
}

/**
 * Verify OTP provided by user
 * Called when user submits the 6-digit code from email
 */
async function verifyOTPCode(email, providedOTP) {
  try {
    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(providedOTP)) {
      return {
        success: false,
        message: 'OTP must be 6 digits.'
      };
    }

    // Get user's stored OTP
    const userResult = await executeQuery(
      `SELECT otp_code, otp_expiry, otp_attempts, otp_locked_until FROM users WHERE email = ?`,
      [email]
    );

    if (userResult.length === 0) {
      return {
        success: false,
        message: 'User not found.'
      };
    }

    const user = userResult[0];

    // Check if account is locked
    if (user.otp_locked_until) {
      const lockedUntil = new Date(user.otp_locked_until);
      if (new Date() < lockedUntil) {
        const waitMinutes = Math.ceil((lockedUntil - new Date()) / 60000);
        return {
          success: false,
          isLocked: true,
          message: `Account is locked. Try again in ${waitMinutes} minute(s).`,
          lockedUntil: lockedUntil.toISOString(),
          attempts: MAX_OTP_ATTEMPTS
        };
      }
      await resetOTPAttempts(email);
    }

    // Check if OTP exists
    if (!user.otp_code) {
      return {
        success: false,
        message: 'No OTP requested for this email. Please login first.'
      };
    }

    // Check if OTP expired
    const otpExpiry = new Date(user.otp_expiry);
    if (new Date() > otpExpiry) {
      await clearOTP(email);
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      };
    }

    // Verify OTP
    try {
      const isValid = verifyOTP(providedOTP, user.otp_code);

      if (!isValid) {
        const newAttempts = (user.otp_attempts || 0) + 1;

        if (newAttempts >= MAX_OTP_ATTEMPTS) {
          const lockUntilTime = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000);
          await executeQuery(
            `UPDATE users SET otp_attempts = ?, otp_locked_until = ? WHERE email = ?`,
            [newAttempts, lockUntilTime, email]
          );

          return {
            success: false,
            isLocked: true,
            message: `Account locked after ${MAX_OTP_ATTEMPTS} failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`,
            lockedUntil: lockUntilTime.toISOString(),
            attempts: newAttempts
          };
        }

        await executeQuery(
          'UPDATE users SET otp_attempts = ? WHERE email = ?',
          [newAttempts, email]
        );

        const remainingAttempts = MAX_OTP_ATTEMPTS - newAttempts;
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
          attempts: newAttempts
        };
      }

      // OTP is valid - clear it and return success
      await clearOTP(email);

      return {
        success: true,
        message: 'OTP verified successfully.'
      };
    } catch (error) {
      const newAttempts = (user.otp_attempts || 0) + 1;

      if (newAttempts >= MAX_OTP_ATTEMPTS) {
        const lockUntilTime = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000);
        await executeQuery(
          `UPDATE users SET otp_attempts = ?, otp_locked_until = ? WHERE email = ?`,
          [newAttempts, lockUntilTime, email]
        );

        return {
          success: false,
          isLocked: true,
          message: `Account locked after ${MAX_OTP_ATTEMPTS} failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`,
          lockedUntil: lockUntilTime.toISOString(),
          attempts: newAttempts
        };
      }

      await executeQuery(
        'UPDATE users SET otp_attempts = ? WHERE email = ?',
        [newAttempts, email]
      );

      const remainingAttempts = MAX_OTP_ATTEMPTS - newAttempts;
      return {
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
        attempts: newAttempts
      };
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Error verifying OTP. Please try again.'
    };
  }
}

/**
 * Clear OTP fields after successful verification
 */
async function clearOTP(email) {
  try {
    await executeQuery(
      `UPDATE users SET otp_code = NULL, otp_expiry = NULL, otp_attempts = 0, otp_locked_until = NULL WHERE email = ?`,
      [email]
    );
  } catch (error) {
    console.error('Error clearing OTP:', error);
  }
}

/**
 * Reset OTP attempt counter (called when lock duration expires)
 */
async function resetOTPAttempts(email) {
  try {
    await executeQuery(
      `UPDATE users SET otp_attempts = 0, otp_locked_until = NULL WHERE email = ?`,
      [email]
    );
  } catch (error) {
    console.error('Error resetting OTP attempts:', error);
  }
}

/**
 * Check if OTP is required for a user email
 */
async function isOTPPending(email) {
  try {
    const result = await executeQuery(
      `SELECT otp_code FROM users WHERE email = ?`,
      [email]
    );
    return result.length > 0 && result[0].otp_code !== null;
  } catch (error) {
    console.error('Error checking OTP status:', error);
    return false;
  }
}

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP,
  generateAndSendOTP,
  verifyOTPCode,
  clearOTP,
  resetOTPAttempts,
  isOTPPending,
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,
  MAX_OTP_ATTEMPTS,
  LOCKOUT_DURATION_MINUTES
};
