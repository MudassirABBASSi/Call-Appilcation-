const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const assignmentController = require('../controllers/assignmentController');
const submissionController = require('../controllers/submissionController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { uploadSubmission, handleMulterError } = require('../middleware/uploadMiddleware');

// All routes require authentication and student role
router.use(authMiddleware);
router.use(checkRole('student'));

// ========== ASSIGNMENT & SUBMISSION ROUTES ==========

// GET /api/student/assignments - Get all assignments for student's enrolled courses (with submission status)
router.get('/assignments', assignmentController.getAllAssignments);

// POST /api/student/submit/:assignmentId - Submit an assignment (with file upload)
router.post('/submit/:assignmentId', uploadSubmission, handleMulterError, (req, res) => {
  // Set the assignment_id from URL params
  req.body.assignment_id = req.params.assignmentId;
  
  // Attach file URL if file was uploaded
  if (req.file) {
    req.body.file_url = `/uploads/submissions/${req.file.filename}`;
  }
  
  submissionController.submitAssignment(req, res);
});

// ========== CLASS ROUTES (Legacy) ==========

// GET /api/student/classes - Get upcoming classes
router.get('/classes', studentController.getClasses);

// POST /api/student/join/:classId - Join class (mark attendance)
router.post('/join/:classId', studentController.joinClass);

module.exports = router;
