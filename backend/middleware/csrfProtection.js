const csrf = require('csurf');

/**
 * CSRF Protection Middleware
 * Uses cookie-based CSRF token protection (Double-Submit Cookie pattern)
 * 
 * How it works:
 * 1. GET /api/csrf-token returns a token in response body + sets httpOnly cookie
 * 2. Frontend stores token and sends it in x-csrf-token header on mutations
 * 3. csurf validates the token from header against the cookie value
 * 4. If valid, request proceeds; if invalid, returns 403 Forbidden
 */

/**
 * Create CSRF protection middleware
 * Uses cookie-based tokens (secure, httpOnly for cookies)
 * Only validates on state-changing requests (POST, PUT, DELETE, PATCH)
 */
const csrfProtection = csrf({
  cookie: {
    httpOnly: true, // Prevents JavaScript access to cookie (XSS protection)
    secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
    sameSite: 'strict', // CSRF protection
    maxAge: 3600000 // 1 hour
  },
  // Skip CSRF validation for GET, HEAD, OPTIONS requests (read-only operations)
  skip: (req) => {
    return req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS';
  }
});

/**
 * Endpoint to GET CSRF token
 * Should be called once on frontend app initialization
 * Returns token in both cookie (automatic by csurf) and response body
 * 
 * @route GET /api/csrf-token
 * @access Public
 * @returns {Object} { success: true, token: "..." }
 */
const getCsrfToken = (req, res) => {
  res.json({
    success: true,
    token: req.csrfToken()
  });
};

/**
 * CSRF Error Handler
 * Handles CSRF validation failures gracefully
 * Called when CSRF token is invalid or missing
 * 
 * @param {Error} err - The CSRF error
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const csrfErrorHandler = (err, req, res, next) => {
  // Only handle CSRF errors
  if (err.code === 'EBADCSRFTOKEN') {
    console.warn(`CSRF token validation failed for IP: ${req.ip}`);
    
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed. Please refresh and try again.',
      error: 'INVALID_CSRF_TOKEN'
    });
  }
  
  // Pass other errors to default error handler
  next(err);
};

/**
 * Conditional CSRF middleware
 * Applies CSRF protection only to specified routes
 * Use this to apply CSRF selectively
 */
const conditionalCsrf = (req, res, next) => {
  const statefulMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  if (statefulMethods.includes(req.method)) {
    return csrfProtection(req, res, next);
  }
  
  next();
};

module.exports = {
  csrfProtection,
  getCsrfToken,
  csrfErrorHandler
};
