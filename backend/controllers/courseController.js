const Course = require('../models/Course');

const courseController = {
  // Create a new course (Teacher only)
  createCourse: (req, res) => {
    const { name, description } = req.body;
    const teacher_id = req.user.id;

    if (!name) {
      return res.status(400).json({ message: 'Course name is required' });
    }

    const courseData = {
      name,
      description: description || '',
      teacher_id
    };

    Course.create(courseData, (err, result) => {
      if (err) {
        console.error('Error creating course:', err);
        return res.status(500).json({ message: 'Error creating course', error: err.message });
      }
      res.status(201).json({ 
        message: 'Course created successfully', 
        course: { id: result.insertId, ...courseData } 
      });
    });
  },

  // Get all courses (Admin - all courses, Teacher - own courses, Student - enrolled courses)
  getAllCourses: (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'admin') {
      // Admin sees all courses
      Course.getAll((err, courses) => {
        if (err) {
          console.error('Error retrieving courses:', err);
          return res.status(500).json({ message: 'Error retrieving courses', error: err.message });
        }
        res.json({ courses });
      });
    } else if (userRole === 'teacher') {
      // Teacher sees only their courses
      Course.getByTeacherId(userId, (err, courses) => {
        if (err) {
          console.error('Error retrieving teacher courses:', err);
          return res.status(500).json({ message: 'Error retrieving courses', error: err.message });
        }
        res.json({ courses });
      });
    } else if (userRole === 'student') {
      // Student sees only enrolled courses
      Course.getByStudentId(userId, (err, courses) => {
        if (err) {
          console.error('Error retrieving student courses:', err);
          return res.status(500).json({ message: 'Error retrieving courses', error: err.message });
        }
        res.json({ courses });
      });
    }
  },

  // Get single course by ID
  getCourseById: (req, res) => {
    const { id } = req.params;

    Course.getById(id, (err, course) => {
      if (err) {
        console.error('Error retrieving course:', err);
        return res.status(500).json({ message: 'Error retrieving course', error: err.message });
      }
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json({ course });
    });
  },

  // Get courses by teacher ID
  getCoursesByTeacher: (req, res) => {
    const { teacherId } = req.params;

    Course.getByTeacherId(teacherId, (err, courses) => {
      if (err) {
        console.error('Error retrieving teacher courses:', err);
        return res.status(500).json({ message: 'Error retrieving courses', error: err.message });
      }
      res.json({ courses });
    });
  },

  // Get enrolled students in a course
  getEnrolledStudents: (req, res) => {
    const { courseId } = req.params;

    Course.getEnrolledStudents(courseId, (err, students) => {
      if (err) {
        console.error('Error retrieving enrolled students:', err);
        return res.status(500).json({ message: 'Error retrieving students', error: err.message });
      }
      res.json({ students });
    });
  },

  // Update course (Teacher only - for their courses, Admin for all)
  updateCourse: (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!name) {
      return res.status(400).json({ message: 'Course name is required' });
    }

    // First get the course to check ownership
    Course.getById(id, (err, course) => {
      if (err) {
        return res.status(500).json({ message: 'Error retrieving course' });
      }
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check authorization
      if (userRole !== 'admin' && course.teacher_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this course' });
      }

      const updateData = { name, description: description || '' };

      Course.update(id, updateData, (err) => {
        if (err) {
          console.error('Error updating course:', err);
          return res.status(500).json({ message: 'Error updating course', error: err.message });
        }
        res.json({ message: 'Course updated successfully', course: { id, ...updateData } });
      });
    });
  },

  // Delete course (Admin only or course owner teacher)
  deleteCourse: (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    Course.getById(id, (err, course) => {
      if (err) {
        return res.status(500).json({ message: 'Error retrieving course' });
      }
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      if (userRole !== 'admin' && course.teacher_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this course' });
      }

      Course.delete(id, (err) => {
        if (err) {
          console.error('Error deleting course:', err);
          return res.status(500).json({ message: 'Error deleting course', error: err.message });
        }
        res.json({ message: 'Course deleted successfully' });
      });
    });
  },

  // Enroll student in course (Admin only)
  enrollStudent: (req, res) => {
    const { courseId, studentId } = req.body;

    if (!courseId || !studentId) {
      return res.status(400).json({ message: 'Course ID and Student ID are required' });
    }

    Course.enrollStudent(courseId, studentId, (err) => {
      if (err) {
        console.error('Error enrolling student:', err);
        return res.status(500).json({ message: 'Error enrolling student', error: err.message });
      }
      res.status(201).json({ message: 'Student enrolled successfully' });
    });
  },

  // Unenroll student from course (Admin only)
  unenrollStudent: (req, res) => {
    const { courseId, studentId } = req.body;

    if (!courseId || !studentId) {
      return res.status(400).json({ message: 'Course ID and Student ID are required' });
    }

    Course.unenrollStudent(courseId, studentId, (err) => {
      if (err) {
        console.error('Error unenrolling student:', err);
        return res.status(500).json({ message: 'Error unenrolling student', error: err.message });
      }
      res.json({ message: 'Student unenrolled successfully' });
    });
  },

  // Check if student is enrolled in course
  checkEnrollment: (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id;

    Course.checkEnrollment(courseId, studentId, (err, enrolled) => {
      if (err) {
        console.error('Error checking enrollment:', err);
        return res.status(500).json({ message: 'Error checking enrollment', error: err.message });
      }
      res.json({ enrolled: !!enrolled });
    });
  }
};

module.exports = courseController;
