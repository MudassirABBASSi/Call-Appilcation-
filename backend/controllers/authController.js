const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpService = require('../services/otpService');
const { sendOtpEmail } = require('../services/emailService');

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      // Validate input
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please provide all fields' });
      }

      // Check if user already exists
      User.findByEmail(email, async (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length > 0) {
          return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const userData = {
          name,
          email,
          password: hashedPassword,
          role
        };

        User.create(userData, (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error creating user', error: err });
          }

          res.status(201).json({
            message: 'User created successfully',
            userId: result.insertId
          });
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  /**
   * Login endpoint with 2FA OTP flow
   * Step 1: Verify credentials
   * Step 2: Generate and send OTP
   * Returns: {success: true, requireOTP: true, email: user.email}
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
      }

      // Check if user exists
      User.findByEmail(email, async (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length === 0) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        // ===== NEW: 2FA OTP Flow with 7-day tracking =====
        // Check if OTP is required based on last verification date
        const requiresOtp = await checkIfOtpRequired(user);

        if (!requiresOtp) {
          // User verified OTP within the last 7 days, skip OTP and generate token
          const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
            { expiresIn: '7d' }
          );

          return res.status(200).json({
            success: true,
            requireOTP: false,
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            },
            message: 'Login successful - OTP not required (within 7 days)'
          });
        }

        // OTP is required - password is valid, now generate and send OTP
        const otpResult = await otpService.generateAndSendOTP(
          email,
          (userEmail, otp) => sendOtpEmail(userEmail, otp, user.name)
        );

        if (!otpResult.success) {
          return res.status(500).json({
            success: false,
            message: otpResult.message || 'Failed to send OTP. Please try again.'
          });
        }

        // Return requireOTP flag - frontend will show OTP input screen
        return res.json({
          success: true,
          requireOTP: true,
          email: user.email,
          message: 'OTP sent to your email. Please enter it to complete login.'
        });
        // ===== END: 2FA OTP Flow =====
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  },

  /**
   * Verify OTP endpoint - Complete 2FA process
   * Step 1: Validate OTP with database
   * Step 2: If valid, generate and return JWT token
   * 
   * Request: { email, otp }
   * Response: { success: true, token, user } or { success: false, isLocked, message }
   */
  verifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;

      // Validate input
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and OTP'
        });
      }

      // Verify OTP using service
      const otpVerifyResult = await otpService.verifyOTPCode(email, otp);

      if (!otpVerifyResult.success) {
        // OTP verification failed
        if (otpVerifyResult.isLocked) {
          // Account is locked due to too many failed attempts
          return res.status(423).json({
            success: false,
            isLocked: true,
            message: otpVerifyResult.message,
            lockedUntil: otpVerifyResult.lockedUntil,
            attempts: otpVerifyResult.attempts
          });
        }

        // Invalid OTP
        return res.status(401).json({
          success: false,
          message: otpVerifyResult.message,
          attempts: otpVerifyResult.attempts
        });
      }

      // OTP is valid, fetch user and generate JWT
      User.findByEmail(email, (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err
          });
        }

        if (results.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'User not found'
          });
        }

        const user = results[0];

        // Update otp_verified_at timestamp to track when user last verified OTP
        User.updateOtpVerifiedAt(user.id, (updateErr) => {
          if (updateErr) {
            console.error('Error updating otp_verified_at timestamp:', updateErr);
            // Continue with login even if timestamp update fails
          }
        });

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
          { expiresIn: '7d' }
        );

        // Login successful!
        res.status(200).json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during OTP verification',
        error: error.message
      });
    }
  }
};

/**
 * Helper function to check if OTP is required for a user
 * OTP is required if:
 * 1. User has never verified OTP (otp_verified_at is NULL) - new user or first login
 * 2. Last OTP verification was more than 7 days ago
 * 
 * @param {Object} user - User object with otp_verified_at field
 * @returns {boolean} - true if OTP is required, false otherwise
 */
async function checkIfOtpRequired(user) {
  // If otp_verified_at is NULL, user is new or has never verified OTP
  if (!user.otp_verified_at) {
    return true;
  }

  // Calculate days since last OTP verification
  const lastVerification = new Date(user.otp_verified_at);
  const now = new Date();
  const daysSinceVerification = Math.floor((now - lastVerification) / (1000 * 60 * 60 * 24));

  // Require OTP if more than 7 days have passed
  return daysSinceVerification > 7;
}

module.exports = authController;
