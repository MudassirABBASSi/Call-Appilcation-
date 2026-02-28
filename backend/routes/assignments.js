const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { uploadAssignment } = require('../middleware/upload');
const { authMiddleware } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// TEACHER ROUTES
router.post('/create', uploadAssignment, assignmentController.createAssignment);
router.get('/teacher/list', assignmentController.getTeacherAssignments);
router.get('/teacher/:id', assignmentController.getAssignmentDetail);
router.put('/teacher/:id', uploadAssignment, assignmentController.updateAssignment);
router.delete('/teacher/:id', assignmentController.deleteAssignment);
router.get('/teacher/:classId/students', assignmentController.getClassStudents);

// STUDENT ROUTES
router.get('/student/list', assignmentController.getStudentAssignments);
router.get('/student/:id', assignmentController.getStudentAssignmentDetail);

// ADMIN ROUTES
router.get('/admin/list', assignmentController.getAllAssignments);

module.exports = router;
