const Joi = require('joi');

/**
 * Validation Middleware Factory
 * Creates middleware for validating request bodies against Joi schemas
 * 
 * Usage:
 * router.post('/endpoint', validate(loginSchema), controller);
 * 
 * @param {Object} schema - Joi schema to validate against
 * @param {string} source - Where to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    // Get the data to validate
    const dataToValidate = req[source];

    // Validate against schema with detailed error messages
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Get all errors, not just first one
      stripUnknown: true, // Remove unknown fields
      messages: {
        'string.email': 'Please provide a valid email address',
        'string.min': 'This field must be at least {#limit} characters',
        'string.max': 'This field must not exceed {#limit} characters',
        'any.required': 'This field is required',
        'date.base': 'This field must be a valid date',
        'date.min': 'Date must be in the future',
        'string.pattern.base': 'This field contains invalid characters'
      }
    });

    if (error) {
      // Extract error messages
      const messages = error.details.map(detail => {
        const field = detail.path.join('.');
        return `${field}: ${detail.message}`;
      });

      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation failed',
        errors: messages, // All validation errors
        code: 'VALIDATION_ERROR'
      });
    }

    // Validation passed - replace request data with validated (sanitized) data
    req[source] = value;
    next();
  };
};

/**
 * =====================================================
 * AUTHENTICATION SCHEMAS
 * =====================================================
 */

// Login Schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim(),
  password: Joi.string()
    .min(8)
    .required()
}).unknown(false); // Reject unknown fields

// Register Schema
const registerSchema = Joi.object({
  name: Joi.string()
    .required()
    .min(3)
    .max(100)
    .trim(),
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim(),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) // At least one lowercase, uppercase, digit
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers'
    }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('password')) // Must match password
    .messages({
      'any.only': 'Passwords do not match'
    }),
  role: Joi.string()
    .valid('teacher', 'student')
    .required()
}).unknown(false);

// Forgot Password Schema
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
}).unknown(false);

// Reset Password Schema
const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers'
    }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .messages({
      'any.only': 'Passwords do not match'
    })
}).unknown(false);

/**
 * =====================================================
 * CLASSROOM & CLASS SCHEMAS
 * =====================================================
 */

// Create Class Schema
const createClassSchema = Joi.object({
  className: Joi.string()
    .required()
    .min(3)
    .max(100)
    .trim(),
  description: Joi.string()
    .max(500)
    .trim()
    .allow(''),
  schedule: Joi.string()
    .required()
    .min(3)
    .max(100),
  startDate: Joi.date()
    .required()
    .min('now')
    .messages({
      'date.min': 'Start date must be in the future'
    }),
  endDate: Joi.date()
    .required()
    .min(Joi.ref('startDate'))
    .messages({
      'date.min': 'End date must be after start date'
    }),
  maxStudents: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .required()
}).unknown(false);

// Update Class Schema
const updateClassSchema = Joi.object({
  className: Joi.string()
    .min(3)
    .max(100)
    .trim(),
  description: Joi.string()
    .max(500)
    .trim()
    .allow(''),
  schedule: Joi.string()
    .min(3)
    .max(100),
  endDate: Joi.date(),
  maxStudents: Joi.number()
    .integer()
    .min(1)
    .max(1000)
}).unknown(false);

/**
 * =====================================================
 * ASSIGNMENT SCHEMAS
 * =====================================================
 */

// Create Assignment Schema
const createAssignmentSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(3)
    .max(200)
    .trim(),
  description: Joi.string()
    .required()
    .min(10)
    .max(2000)
    .trim(),
  classId: Joi.number()
    .integer()
    .required()
    .positive(),
  dueDate: Joi.date()
    .required()
    .min('now')
    .messages({
      'date.min': 'Due date must be in the future'
    }),
  totalMarks: Joi.number()
    .integer()
    .positive()
    .required()
    .max(1000),
  instructions: Joi.string()
    .max(1000)
    .allow('')
}).unknown(false);

// Grade Assignment Schema
const gradeAssignmentSchema = Joi.object({
  marksObtained: Joi.number()
    .integer()
    .min(0)
    .required(),
  marksTotal: Joi.number()
    .integer()
    .positive()
    .required(),
  feedback: Joi.string()
    .max(1000)
    .trim()
    .allow('')
}).unknown(false);

/**
 * =====================================================
 * ATTENDANCE SCHEMAS
 * =====================================================
 */

// Mark Attendance Schema
const markAttendanceSchema = Joi.object({
  studentId: Joi.number()
    .integer()
    .required()
    .positive(),
  status: Joi.string()
    .valid('present', 'absent', 'late')
    .required(),
  remarks: Joi.string()
    .max(200)
    .allow('')
}).unknown(false);

/**
 * =====================================================
 * USER/PROFILE SCHEMAS
 * =====================================================
 */

// Update Profile Schema
const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .trim(),
  email: Joi.string()
    .email()
    .lowercase()
    .trim(),
  phone: Joi.string()
    .pattern(/^[0-9\-\+\(\)\s]+$/)
    .max(20)
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
}).unknown(false);

// Change Password Schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required(),
  newPassword: Joi.string()
    .min(8)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers'
    }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('newPassword'))
    .messages({
      'any.only': 'Passwords do not match'
    })
}).unknown(false);

/**
 * =====================================================
 * OTP & TWO-FACTOR AUTH SCHEMAS
 * =====================================================
 */

// Send OTP Schema
const sendOtpSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
}).unknown(false);

// Verify OTP Schema
const verifyOtpSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.length': 'OTP must be 6 digits',
      'string.pattern.base': 'OTP must contain only numbers'
    })
}).unknown(false);

/**
 * =====================================================
 * MESSAGE SCHEMAS
 * =====================================================
 */

// Send Message Schema
const sendMessageSchema = Joi.object({
  recipientId: Joi.number()
    .integer()
    .required()
    .positive(),
  message: Joi.string()
    .required()
    .min(1)
    .max(5000)
    .trim()
}).unknown(false);

module.exports = {
  validate,
  // Auth schemas
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  // Class schemas
  createClassSchema,
  updateClassSchema,
  // Assignment schemas
  createAssignmentSchema,
  gradeAssignmentSchema,
  // Attendance schemas
  markAttendanceSchema,
  // User schemas
  updateProfileSchema,
  changePasswordSchema,
  // OTP schemas
  sendOtpSchema,
  verifyOtpSchema,
  // Message schemas
  sendMessageSchema
};
