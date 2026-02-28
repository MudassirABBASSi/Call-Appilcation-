const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// All routes require authentication and student role
router.use(authMiddleware);
router.use(checkRole('student'));

// GET /api/student/classes - Get upcoming classes
router.get('/classes', studentController.getClasses);

// GET /api/student/assignments - Get assignments for student based on enrolled classes
const assignmentController = require('../controllers/assignmentController');
router.get('/assignments', assignmentController.getStudentAssignments);

// POST /api/student/join/:classId - Join class (mark attendance)
router.post('/join/:classId', studentController.joinClass);

module.exports = router;
