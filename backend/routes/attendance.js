const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Mark student present - POST /api/attendance/mark-present
router.post('/mark-present', attendanceController.markPresent);

// Mark student absent - POST /api/attendance/mark-absent
router.post('/mark-absent', attendanceController.markAbsent);

// Record leave time - POST /api/attendance/record-leave/:classId/:studentId
router.post('/record-leave/:classId/:studentId', attendanceController.recordLeaveTime);

// Get class attendance - GET /api/attendance/class/:classId
router.get('/class/:classId', attendanceController.getClassAttendance);

// Get student attendance - GET /api/attendance/student/:studentId
router.get('/student/:studentId', attendanceController.getStudentAttendance);

// Get attendance record - GET /api/attendance/:classId/:studentId
router.get('/:classId/:studentId', attendanceController.getAttendanceRecord);

// Get class attendance statistics - GET /api/attendance/stats/:classId
router.get('/stats/class/:classId', attendanceController.getAttendanceStats);

// Get student attendance percentage - GET /api/attendance/percentage/:studentId
router.get('/percentage/:studentId', attendanceController.getStudentAttendancePercentage);

// Update attendance status - PUT /api/attendance/:classId/:studentId
router.put('/:classId/:studentId', attendanceController.updateAttendanceStatus);

// Delete attendance record - DELETE /api/attendance/:classId/:studentId
router.delete('/:classId/:studentId', attendanceController.deleteAttendance);

// Get student class history - GET /api/attendance/history/:studentId
router.get('/history/:studentId', attendanceController.getStudentClassHistory);

module.exports = router;
