const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * File Upload Validation
 * Handles file type validation, size limits, and security checks
 */

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Allowed file types
 * MIME types for documents and images
 */
const ALLOWED_MIME_TYPES = {
  // Documents
  'application/pdf': {
    ext: 'pdf',
    category: 'document'
  },
  'application/msword': {
    ext: 'doc',
    category: 'document'
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    ext: 'docx',
    category: 'document'
  },
  // Images
  'image/png': {
    ext: 'png',
    category: 'image'
  },
  'image/jpeg': {
    ext: 'jpg',
    category: 'image'
  },
  'image/jpg': {
    ext: 'jpg',
    category: 'image'
  }
};

/**
 * File size limits (in bytes)
 */
const FILE_SIZE_LIMITS = {
  document: 5 * 1024 * 1024, // 5MB for documents
  image: 5 * 1024 * 1024, // 5MB for images
  general: 5 * 1024 * 1024 // 5MB default
};

/**
 * Storage configuration for multer
 * Saves files to uploads directory with sanitized names
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename: remove special characters, add timestamp
    const sanitized = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();
    const timestamp = Date.now();
    const filename = `${timestamp}_${sanitized}`;
    cb(null, filename);
  }
});

/**
 * File filter function
 * Validates file type and prevents dangerous files
 * 
 * @param {Object} req - Express request
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  // Check if mimetype is allowed
  const mimeInfo = ALLOWED_MIME_TYPES[file.mimetype];

  if (!mimeInfo) {
    const allowedTypes = Object.keys(ALLOWED_MIME_TYPES)
      .map(mime => ALLOWED_MIME_TYPES[mime].ext)
      .join(', ');
    
    const error = new Error(`Invalid file type. Allowed types: ${allowedTypes}`);
    error.status = 400;
    error.code = 'INVALID_FILE_TYPE';
    return cb(error);
  }

  // Double-check extension matches MIME type
  const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
  if (fileExt !== mimeInfo.ext && fileExt !== 'jpeg') {
    // Allow jpeg as alias for jpg
    if (!(fileExt === 'jpeg' && mimeInfo.ext === 'jpg')) {
      const error = new Error('File extension does not match file type');
      error.status = 400;
      error.code = 'EXTENSION_MISMATCH';
      return cb(error);
    }
  }

  // Validation passed
  cb(null, true);
};

/**
 * Create multer instance with configurations
 * Limits: 5MB per file, single file upload
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.general // 5MB
  }
});

/**
 * Create multer instance for multiple files
 * Limits: 5MB per file, up to 10 files
 */
const uploadMultiple = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.general,
    files: 10
  }
});

/**
 * Error handler for multer file upload errors
 * Called after multer middleware catches an error
 * 
 * @param {Error} error - Error thrown by multer
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const handleUploadError = (error, req, res, next) => {
  // Handle specific multer errors
  if (error instanceof multer.MulterError) {
    // File too large
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 5MB.',
        code: 'FILE_TOO_LARGE',
        maxSize: '5MB'
      });
    }

    // Too many files
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.',
        code: 'TOO_MANY_FILES'
      });
    }

    // Unexpected field
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
        code: 'UNEXPECTED_FILE_FIELD'
      });
    }
  }

  // Handle custom validation errors
  if (error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: error.code
    });
  }

  if (error.code === 'EXTENSION_MISMATCH') {
    return res.status(400).json({
      success: false,
      message: 'File extension does not match the file type.',
      code: error.code
    });
  }

  // Handle any other errors
  if (error.status === 400) {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: error.code || 'FILE_UPLOAD_ERROR'
    });
  }

  // Server error
  console.error('File upload error:', error);
  return res.status(500).json({
    success: false,
    message: 'File upload failed. Please try again.',
    code: 'UPLOAD_SERVER_ERROR'
  });
};

/**
 * Middleware to validate file presence
 * Use when file is required
 */
const requireFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'File is required.',
      code: 'NO_FILE_PROVIDED'
    });
  }
  next();
};

/**
 * Middleware to validate multiple files presence
 * Use when files are required
 */
const requireFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one file is required.',
      code: 'NO_FILES_PROVIDED'
    });
  }
  next();
};

module.exports = {
  upload,
  uploadMultiple,
  handleUploadError,
  requireFile,
  requireFiles,
  ALLOWED_MIME_TYPES,
  FILE_SIZE_LIMITS
};
