const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Middleware for authentication
router.use(authMiddleware);

// Create assignment (Teacher only)
router.post('/', (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can create assignments' });
  }
  assignmentController.createAssignment(req, res);
});

// Get all assignments (Admin sees all, Teacher sees own, Student sees for enrolled courses)
router.get('/', assignmentController.getAllAssignments);

// Get assignments for a course (MUST come before /:id)
router.get('/course/:courseId', assignmentController.getAssignmentsByCourse);

// Get assignments created by teacher (MUST come before /:id)
router.get('/teacher/:teacherId', assignmentController.getAssignmentsByTeacher);

// Get assignments for current student (MUST come before /:id)
router.get('/student/my-assignments', (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can fetch their assignments' });
  }
  assignmentController.getAssignmentsForStudent(req, res);
});

// Get assignment by ID (MUST come last)
router.get('/:id', assignmentController.getAssignmentById);

// Get submissions for an assignment
router.get('/:assignmentId/submissions', (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only teachers and admins can view submissions' });
  }
  assignmentController.getAssignmentSubmissions(req, res);
});

// Update assignment (Teacher for own, Admin for all)
router.put('/:id', (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update assignments' });
  }
  assignmentController.updateAssignment(req, res);
});

// Delete assignment (Teacher for own, Admin for all)
router.delete('/:id', (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete assignments' });
  }
  assignmentController.deleteAssignment(req, res);
});

module.exports = router;
