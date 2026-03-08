const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const { validate, forgotPasswordSchema, resetPasswordSchema } = require('../middleware/validation');

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset - sends email with reset link
 * @access  Public
 */
router.post('/forgot-password', validate(forgotPasswordSchema), passwordController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password using valid token
 * @access  Public
 */
router.post('/reset-password/:token', validate(resetPasswordSchema), passwordController.resetPassword);

/**
 * @route   GET /api/auth/verify-reset-token/:token
 * @desc    Verify if reset token is valid (for frontend validation)
 * @access  Public
 */
router.get('/verify-reset-token/:token', passwordController.verifyResetToken);

module.exports = router;
