const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passwordRoutes = require('./passwordRoutes');
const { validate, registerSchema, loginSchema, verifyOtpSchema } = require('../middleware/validation');
const { otpVerifyLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register - Register new user with validation
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login - Login user with OTP 2FA flow and validation
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/verify-otp - Verify 2FA OTP code with validation and rate limiting
router.post('/verify-otp', otpVerifyLimiter, validate(verifyOtpSchema), authController.verifyOtp);

// Mount password reset routes
router.use('/', passwordRoutes);

module.exports = router;
