const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// Student enrollment routes - MUST be before /:id routes
router.get('/student/my-classes', authMiddleware, classController.getStudentClasses);
router.post('/:classId/enroll', authMiddleware, classController.enrollStudent);
router.delete('/:classId/unenroll', authMiddleware, classController.unenrollStudent);

// Public class routes (all authenticated users)
router.get('/list', authMiddleware, classController.getAllClasses);
router.get('/active', authMiddleware, classController.getActiveClasses);
router.get('/:id', authMiddleware, classController.getClassDetails);
router.get('/:id/students', authMiddleware, classController.getClassStudents);
router.get('/teacher/:teacherId/students', authMiddleware, classController.getTeacherStudents);

// Admin routes
router.post('/', authMiddleware, checkRole('admin'), classController.createClass);
router.put('/:id', authMiddleware, checkRole('admin'), classController.updateClass);
router.delete('/:id', authMiddleware, checkRole('admin'), classController.deleteClass);

module.exports = router;
