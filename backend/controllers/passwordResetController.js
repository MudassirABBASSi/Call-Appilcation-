const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail, sendPasswordResetConfirmation } = require('../services/emailService');

/**
 * Generate secure random token
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash token for database storage
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const passwordResetController = {
  /**
   * POST /api/auth/forgot-password
   * Initiates password reset process
   */
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      // Validate input
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: 'Please provide your email address' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false,
          message: 'Please provide a valid email address' 
        });
      }

      // Check if user exists
      User.findByEmail(email, async (err, results) => {
        if (err) {
          console.error('Database error in forgotPassword:', err);
          return res.status(500).json({ 
            success: false,
            message: 'An error occurred. Please try again later.' 
          });
        }

        // Security: Don't reveal if email exists or not (prevents user enumeration)
        // Always return success message
        if (results.length === 0) {
          return res.status(200).json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link shortly.'
          });
        }

        const user = results[0];

        try {
          // Generate secure reset token
          const resetToken = generateResetToken();
          const hashedToken = hashToken(resetToken);

          // Set token expiry to 1 hour from now
          const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

          // Save hashed token to database
          User.setResetToken(email, hashedToken, expiryDate, async (err, result) => {
            if (err) {
              console.error('Error saving reset token:', err);
              return res.status(500).json({ 
                success: false,
                message: 'Failed to process password reset. Please try again.' 
              });
            }

            // Create reset link with plain token (only sent via email, never stored)
            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

            // Send password reset email
            try {
              await sendPasswordResetEmail(user.email, resetLink, user.name);
              
              res.status(200).json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link shortly.'
              });
            } catch (emailError) {
              console.error('Error sending reset email:', emailError);
              
              // Clear the token if email fails
              User.clearResetToken(user.id, () => {});
              
              return res.status(500).json({ 
                success: false,
                message: 'Failed to send reset email. Please try again or contact support.' 
              });
            }
          });
        } catch (error) {
          console.error('Error in token generation:', error);
          return res.status(500).json({ 
            success: false,
            message: 'An error occurred. Please try again later.' 
          });
        }
      });
    } catch (error) {
      console.error('Server error in forgotPassword:', error);
      res.status(500).json({ 
        success: false,
        message: 'An error occurred. Please try again later.' 
      });
    }
  },

  /**
   * POST /api/auth/reset-password/:token
   * Resets user password using valid token
   */
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;

      // Validate inputs
      if (!token) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid or missing reset token' 
        });
      }

      if (!password || !confirmPassword) {
        return res.status(400).json({ 
          success: false,
          message: 'Please provide both password and confirmation' 
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ 
          success: false,
          message: 'Passwords do not match' 
        });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({ 
          success: false,
          message: 'Password must be at least 6 characters long' 
        });
      }

      // Hash the token to match database
      const hashedToken = hashToken(token);

      // Find user by valid token (also checks expiry)
      User.findByResetToken(hashedToken, async (err, results) => {
        if (err) {
          console.error('Database error in resetPassword:', err);
          return res.status(500).json({ 
            success: false,
            message: 'An error occurred. Please try again later.' 
          });
        }

        if (results.length === 0) {
          return res.status(400).json({ 
            success: false,
            message: 'Invalid or expired reset token. Please request a new password reset.' 
          });
        }

        const user = results[0];

        try {
          // Hash new password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          // Update password
          User.updatePassword(user.id, hashedPassword, (err, result) => {
            if (err) {
              console.error('Error updating password:', err);
              return res.status(500).json({ 
                success: false,
                message: 'Failed to update password. Please try again.' 
              });
            }

            // Clear reset token (prevent reuse)
            User.clearResetToken(user.id, async (err) => {
              if (err) {
                console.error('Error clearing reset token:', err);
              }

              // Send confirmation email (non-blocking)
              try {
                await sendPasswordResetConfirmation(user.email, user.name);
              } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
                // Continue anyway - password was successfully reset
              }

              res.status(200).json({
                success: true,
                message: 'Password successfully reset. You can now login with your new password.'
              });
            });
          });
        } catch (error) {
          console.error('Error hashing password:', error);
          return res.status(500).json({ 
            success: false,
            message: 'An error occurred. Please try again later.' 
          });
        }
      });
    } catch (error) {
      console.error('Server error in resetPassword:', error);
      res.status(500).json({ 
        success: false,
        message: 'An error occurred. Please try again later.' 
      });
    }
  },

  /**
   * GET /api/auth/verify-reset-token/:token
   * Verifies if a reset token is valid (for frontend validation)
   */
  verifyResetToken: async (req, res) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ 
          success: false,
          valid: false,
          message: 'Token is required' 
        });
      }

      const hashedToken = hashToken(token);

      User.findByResetToken(hashedToken, (err, results) => {
        if (err) {
          console.error('Database error in verifyResetToken:', err);
          return res.status(500).json({ 
            success: false,
            valid: false,
            message: 'Error verifying token' 
          });
        }

        if (results.length === 0) {
          return res.status(200).json({ 
            success: true,
            valid: false,
            message: 'Invalid or expired token' 
          });
        }

        res.status(200).json({ 
          success: true,
          valid: true,
          message: 'Token is valid' 
        });
      });
    } catch (error) {
      console.error('Server error in verifyResetToken:', error);
      res.status(500).json({ 
        success: false,
        valid: false,
        message: 'An error occurred' 
      });
    }
  }
};

module.exports = passwordResetController;
