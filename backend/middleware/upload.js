const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const uploadsDir = path.join(__dirname, '../uploads');
const assignmentsDir = path.join(uploadsDir, 'assignments');
const submissionsDir = path.join(uploadsDir, 'submissions');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(assignmentsDir)) {
    fs.mkdirSync(assignmentsDir, { recursive: true });
}
if (!fs.existsSync(submissionsDir)) {
    fs.mkdirSync(submissionsDir, { recursive: true });
}

// Allowed file types
const ALLOWED_MIMETYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Storage configuration for assignments
const assignmentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, assignmentsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `assignment-${uniqueSuffix}${ext}`);
    }
});

// Storage configuration for submissions
const submissionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, submissionsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `submission-${uniqueSuffix}${ext}`);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // Check file extension
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
    }

    // Check MIME type
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
        return cb(new Error('Invalid file type'), false);
    }

    cb(null, true);
};

// Create multer instances
const uploadAssignment = multer({
    storage: assignmentStorage,
    fileFilter: fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
});

const uploadSubmission = multer({
    storage: submissionStorage,
    fileFilter: fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
});

module.exports = {
    uploadAssignment: uploadAssignment.single('file'),
    uploadSubmission: uploadSubmission.single('file'),
    assignmentsDir,
    submissionsDir
};
