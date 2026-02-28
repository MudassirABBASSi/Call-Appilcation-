const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const assignmentController = require('../controllers/assignmentController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { uploadAssignment } = require('../middleware/upload');

// All routes require authentication and teacher role
router.use(authMiddleware);
router.use(checkRole('teacher'));

// POST /api/teacher/classes - Create new class
router.post('/classes', teacherController.createClass);

// GET /api/teacher/classes - Get teacher's classes
router.get('/classes', teacherController.getMyClasses);

// GET /api/teacher/students - Get students assigned to teacher
router.get('/students', teacherController.getMyStudents);

// Assignment routes (class-based only)
// POST /api/teacher/assignments - Create assignment
router.post('/assignments', uploadAssignment, assignmentController.createAssignment);

// GET /api/teacher/assignments?class_id=ID - Get assignments for teacher filtered by class
router.get('/assignments', assignmentController.getTeacherAssignments);

// GET /api/teacher/attendance/:classId - Get attendance for a class
router.get('/attendance/:classId', teacherController.getAttendance);

// GET /api/teacher/attendance-report - Get attendance report for all teacher's classes
router.get('/attendance-report', teacherController.getAttendanceReport);

module.exports = router;
