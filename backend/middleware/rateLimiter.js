const rateLimit = require('express-rate-limit');

/**
 * General Rate Limiter
 * Applies to all routes: 100 requests per 15 minutes per IP (production)
 * Development: 500 requests per 15 minutes (to handle React Strict Mode double renders)
 * Production-ready configuration
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 500, // Higher limit in development
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Skip rate limiting for these scenarios
  skip: (req) => {
    // Don't rate limit health checks
    if (req.path === '/health') return true;
    return false;
  },
  
  // Custom key generator (uses IP address by default)
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if behind proxy, otherwise use socket IP
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  },
  
  // Custom handler for rate limit exceeded
  handler: (req, res, next, options) => {
    return res.status(429).json({
      success: false,
      message: options.message.message || 'Too many requests. Please try again later.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Strict Authentication Rate Limiter
 * Applies to login, register, and password reset: 5 requests per 15 minutes per IP (production)
 * Development: 50 requests per 15 minutes (to handle testing and React Strict Mode)
 * Prevents brute force attacks on authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // Higher limit in development
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  },
  standardHeaders: false,
  legacyHeaders: false,
  
  // Custom key generator for auth (uses IP address)
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  },
  
  // Custom handler for rate limit exceeded
  handler: (req, res, next, options) => {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: req.rateLimit.resetTime
    });
  },
  
  // Skip rate limiting for admin health checks
  skip: (req) => {
    // Add condition here if needed for specific scenarios
    return false;
  }
});

/**
 * Strict Password Reset Rate Limiter
 * Extra protection for password reset endpoint
 * 3 requests per 30 minutes per IP
 */
const passwordResetLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again in 30 minutes.'
  },
  standardHeaders: false,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  },
  
  handler: (req, res, next, options) => {
    return res.status(429).json({
      success: false,
      message: 'Too many password reset attempts. Please try again in 30 minutes.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * File Upload Rate Limiter
 * Prevents spam uploads: 10 uploads per hour per IP
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: {
    success: false,
    message: 'Too many uploads. Please try again later.'
  },
  standardHeaders: false,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  },
  
  handler: (req, res, next, options) => {
    return res.status(429).json({
      success: false,
      message: 'Too many uploads. Please try again later.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * OTP Verification Rate Limiter
 * Protects the 2FA OTP verification endpoint
 * 20 requests per 30 minutes per IP
 * Note: Additional account lockout protection is also enforced at application level
 * (5 failed OTP attempts = 15 minute account lock)
 */
const otpVerifyLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many OTP verification attempts. Please try again later.'
  },
  standardHeaders: false,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  },
  
  handler: (req, res, next, options) => {
    return res.status(429).json({
      success: false,
      message: 'Too many OTP verification attempts. Please try again later.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  otpVerifyLimiter
};
