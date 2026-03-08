const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Middleware for authentication
router.use(authMiddleware);

// Create a new course (Teacher only)
router.post('/', (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can create courses' });
  }
  courseController.createCourse(req, res);
});

// Get all courses (Admin sees all, Teacher sees own, Student sees enrolled)
router.get('/', courseController.getAllCourses);

// Get single course by ID
router.get('/:id', courseController.getCourseById);

// Get courses by teacher ID
router.get('/teacher/:teacherId', courseController.getCoursesByTeacher);

// Get enrolled students in a course
router.get('/:courseId/students', courseController.getEnrolledStudents);

// Update course (Teacher for own, Admin for all)
router.put('/:id', (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update courses' });
  }
  courseController.updateCourse(req, res);
});

// Delete course (Admin or course owner)
router.delete('/:id', (req, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete courses' });
  }
  courseController.deleteCourse(req, res);
});

// Enroll student in course (Admin only)
router.post('/enroll', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can enroll students' });
  }
  courseController.enrollStudent(req, res);
});

// Unenroll student from course (Admin only)
router.post('/unenroll', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can unenroll students' });
  }
  courseController.unenrollStudent(req, res);
});

// Check if student is enrolled in course
router.get('/:courseId/check-enrollment', courseController.checkEnrollment);

module.exports = router;
