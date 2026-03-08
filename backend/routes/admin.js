const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const assignmentController = require('../controllers/assignmentController');
const submissionController = require('../controllers/submissionController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(checkRole('admin'));

// ========== ASSIGNMENT & SUBMISSION ROUTES ==========

// GET /api/admin/assignments - View all assignments (with teacher & course name)
router.get('/assignments', assignmentController.getAllAssignments);

// GET /api/admin/submissions - View all submissions
router.get('/submissions', submissionController.getAllSubmissions);

// ========== TEACHERS MANAGEMENT ==========

router.get('/teachers', adminController.getTeachers);
router.get('/teachers/:id', adminController.getTeacherById);
router.post('/teachers', adminController.addTeacher);
router.put('/teachers/:id', adminController.updateTeacher);
router.delete('/teachers/:id', adminController.deleteTeacher);

// ========== STUDENTS MANAGEMENT ==========

router.get('/students', adminController.getStudents);
router.get('/students/:id', adminController.getStudentById);
router.post('/students', adminController.addStudent);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// ========== CLASSES MANAGEMENT ==========

router.get('/classes', adminController.getClasses);
router.post('/classes', adminController.createClass);
router.delete('/classes/:id', adminController.deleteClass);

// ========== ATTENDANCE MANAGEMENT ==========

router.get('/attendance-report', adminController.getAttendanceReport);

// ========== MESSAGES MONITORING ==========

router.get('/messages', adminController.getAllMessages);

module.exports = router;
