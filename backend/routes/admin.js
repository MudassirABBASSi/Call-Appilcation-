const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(checkRole('admin'));

// Teachers management
router.get('/teachers', adminController.getTeachers);
router.post('/teachers', adminController.addTeacher);
router.put('/teachers/:id', adminController.updateTeacher);
router.delete('/teachers/:id', adminController.deleteTeacher);

// Students management
router.get('/students', adminController.getStudents);
router.post('/students', adminController.addStudent);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Classes management
router.get('/classes', adminController.getClasses);
router.post('/classes', adminController.createClass);
router.delete('/classes/:id', adminController.deleteClass);

// Attendance management
router.get('/attendance-report', adminController.getAttendanceReport);

module.exports = router;
