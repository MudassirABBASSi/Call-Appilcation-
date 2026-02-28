const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { uploadSubmission } = require('../middleware/upload');
const { authMiddleware } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// STUDENT ROUTES
router.post('/:id/submit', uploadSubmission, submissionController.submitAssignment);
router.get('/:id/my-submission', submissionController.getStudentSubmission);

// TEACHER ROUTES
router.get('/assignment/:id/submissions', submissionController.getAssignmentSubmissions);
router.put('/:id/grade', submissionController.gradeSubmission);
router.get('/:id/detail', submissionController.getSubmissionDetail);

// ADMIN ROUTES
router.get('/admin/all', submissionController.getAllSubmissions);
router.get('/admin/stats', submissionController.getSubmissionStats);

module.exports = router;
