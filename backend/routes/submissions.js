const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Middleware for authentication
router.use(authMiddleware);

// Submit assignment (Student only)
router.post('/', (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can submit assignments' });
  }
  submissionController.submitAssignment(req, res);
});

// Get submission by ID
router.get('/:id', submissionController.getSubmissionById);

// Get submissions by assignment (Teacher and Admin)
router.get('/assignment/:assignmentId', (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only teachers and admins can view submissions' });
  }
  submissionController.getSubmissionsByAssignment(req, res);
});

// Get student's own submissions
router.get('/my-submissions', (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can fetch their submissions' });
  }
  submissionController.getSubmissionsByStudent(req, res);
});

// Get submission for a specific student-assignment pair
router.get('/assignment/:assignmentId/student/:studentId', (req, res) => {
  if (req.user.role === 'student' && req.user.id != req.params.studentId) {
    return res.status(403).json({ message: 'Not authorized to view this submission' });
  }
  submissionController.getStudentSubmission(req, res);
});

// Grade submission (Teacher and Admin)
router.put('/:id/grade', (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only teachers and admins can grade submissions' });
  }
  submissionController.gradeSubmission(req, res);
});

// Delete submission
router.delete('/:id', submissionController.deleteSubmission);

// Check if student already submitted
router.get('/check/:assignmentId', (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can check their submissions' });
  }
  submissionController.checkSubmissionExists(req, res);
});

module.exports = router;
