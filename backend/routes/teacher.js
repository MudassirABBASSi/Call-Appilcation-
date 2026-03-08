const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const assignmentController = require('../controllers/assignmentController');
const submissionController = require('../controllers/submissionController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { uploadAssignment, handleMulterError } = require('../middleware/uploadMiddleware');

// All routes require authentication and teacher role
router.use(authMiddleware);
router.use(checkRole('teacher'));

// ========== ASSIGNMENT ROUTES ==========

// POST /api/teacher/assignments - Create new assignment (with file upload)
router.post('/assignments', uploadAssignment, handleMulterError, (req, res) => {
  // Attach file URL if file was uploaded
  if (req.file) {
    req.body.file_url = `/uploads/assignments/${req.file.filename}`;
  }
  assignmentController.createAssignment(req, res);
});

// GET /api/teacher/assignments - Get all assignments created by teacher (with submission count)
router.get('/assignments', (req, res) => {
  assignmentController.getAllAssignments(req, res);
});

// GET /api/teacher/assignments/:id - Get assignment by ID
router.get('/assignments/:id', (req, res) => {
  assignmentController.getAssignmentById(req, res);
});

// PUT /api/teacher/assignments/:id - Edit assignment (with optional file upload)
router.put('/assignments/:id', uploadAssignment, handleMulterError, (req, res) => {
  // Attach file URL if file was uploaded
  if (req.file) {
    req.body.file_url = `/uploads/assignments/${req.file.filename}`;
  }
  assignmentController.updateAssignment(req, res);
});

// DELETE /api/teacher/assignments/:id - Delete assignment
router.delete('/assignments/:id', assignmentController.deleteAssignment);

// GET /api/teacher/submissions/:assignmentId - View all submissions for an assignment
router.get('/submissions/:assignmentId', submissionController.getSubmissionsByAssignment);

// PUT /api/teacher/grade/:submissionId - Grade a submission
router.put('/grade/:submissionId', submissionController.gradeSubmission);

// ========== CLASS ROUTES (Legacy) ==========

// POST /api/teacher/classes - Create new class
router.post('/classes', teacherController.createClass);

// GET /api/teacher/classes - Get teacher's classes
router.get('/classes', teacherController.getMyClasses);

// GET /api/teacher/students - Get students assigned to teacher
router.get('/students', teacherController.getMyStudents);

// GET /api/teacher/class-students - Get class-student mappings for teacher classes
router.get('/class-students', teacherController.getClassStudents);

// GET /api/teacher/attendance/:classId - Get attendance for a class
router.get('/attendance/:classId', teacherController.getAttendance);

// GET /api/teacher/attendance-report - Get attendance report for all teacher's classes
router.get('/attendance-report', teacherController.getAttendanceReport);

module.exports = router;
