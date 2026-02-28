const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authMiddleware');

// Middleware
router.use(authMiddleware);

// ===================== ADMIN ROUTES =====================
router.post('/admin/classes', checkRole('admin'), classController.createClass);
router.put('/admin/classes/:id', checkRole('admin'), classController.updateClass);
router.delete('/admin/classes/:id', checkRole('admin'), classController.deleteClass);

// ===================== PUBLIC ROUTES (All authenticated users) =====================
router.get('/list', classController.getAllClasses);
router.get('/active', classController.getActiveClasses);
router.get('/:id', classController.getClassDetails);
router.get('/:id/students', classController.getClassStudents);

// Get teacher's students for enrollment display
router.get('/teacher/:teacherId/students', classController.getTeacherStudents);

// ===================== STUDENT ROUTES =====================
router.post('/student/enroll/:classId', checkRole('student'), classController.enrollStudent);
router.get('/student/my-classes', checkRole('student'), classController.getStudentClasses);
router.delete('/student/classes/:classId', checkRole('student'), classController.unenrollStudent);

module.exports = router;
