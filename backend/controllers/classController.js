const db = require('../config/db');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');

const classController = {
  /**
   * Admin: Create a new class with time management
   * POST /api/admin/classes
   */
  createClass: (req, res) => {
    const { title, description, date, start_time, end_time, teacher_id } = req.body;

    // Validation
    if (!title || !date || !start_time || !end_time || !teacher_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, date, start_time, end_time, teacher_id'
      });
    }

    // Generate unique room ID
    const roomId = `${title.replace(/\s+/g, '-').toLowerCase()}-${uuidv4().substring(0, 8)}`;

    const query = `
      INSERT INTO classes (title, description, date, start_time, end_time, roomId, teacher_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
    `;

    db.query(
      query,
      [title, description, date, start_time, end_time, roomId, teacher_id],
      (err, result) => {
        if (err) {
          console.error('Error creating class:', err);
          return res.status(500).json({
            success: false,
            message: 'Error creating class',
            error: err.message
          });
        }

        res.status(201).json({
          success: true,
          message: 'Class created successfully',
          classId: result.insertId,
          roomId: roomId,
          data: {
            id: result.insertId,
            title,
            description,
            date,
            start_time,
            end_time,
            roomId,
            teacher_id,
            is_active: true
          }
        });
      }
    );
  },

  /**
   * Admin: Get all classes with active filter
   * GET /api/classes
   */
  getAllClasses: (req, res) => {
    const { includeInactive } = req.query;

    let query = `
      SELECT c.*, 
             u.name as teacher_name,
             COUNT(DISTINCT e.student_id) as enrolled_count
      FROM classes c
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON c.id = e.class_id
    `;

    if (includeInactive !== 'true') {
      query += ' WHERE c.is_active = TRUE ';
    }

    query += ' GROUP BY c.id ORDER BY c.date DESC';

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching classes:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching classes',
          error: err.message
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  },

  /**
   * Get active classes for student/teacher
   * GET /api/classes/active
   */
  getActiveClasses: (req, res) => {
    const query = `
      SELECT c.*, 
             u.name as teacher_name,
             COUNT(DISTINCT e.student_id) as enrolled_count
      FROM classes c
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON c.id = e.class_id
      WHERE c.is_active = TRUE AND c.date >= NOW()
      GROUP BY c.id
      ORDER BY c.date ASC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching active classes:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching active classes',
          error: err.message
        });
      }

      res.json({
        success: true,
        data: results
      });
    });
  },

  /**
   * Admin: Update class
   * PUT /api/admin/classes/:id
   */
  updateClass: (req, res) => {
    const classId = req.params.id;
    const { title, description, date, start_time, end_time, teacher_id, is_active } = req.body;

    if (!title || !date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const query = `
      UPDATE classes 
      SET title = ?, description = ?, date = ?, start_time = ?, end_time = ?, teacher_id = ?, is_active = ?
      WHERE id = ?
    `;

    db.query(
      query,
      [title, description, date, start_time, end_time, teacher_id, is_active !== undefined ? is_active : true, classId],
      (err, result) => {
        if (err) {
          console.error('Error updating class:', err);
          return res.status(500).json({
            success: false,
            message: 'Error updating class',
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Class not found'
          });
        }

        res.json({
          success: true,
          message: 'Class updated successfully'
        });
      }
    );
  },

  /**
   * Admin: Delete class (soft delete - set is_active = FALSE)
   * DELETE /api/admin/classes/:id
   */
  deleteClass: (req, res) => {
    const classId = req.params.id;

    // Soft delete - set is_active = FALSE
    const query = 'UPDATE classes SET is_active = FALSE WHERE id = ?';

    db.query(query, [classId], (err, result) => {
      if (err) {
        console.error('Error deleting class:', err);
        return res.status(500).json({
          success: false,
          message: 'Error deleting class',
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      res.json({
        success: true,
        message: 'Class deleted successfully'
      });
    });
  },

  /**
   * Admin: Get students assigned to a teacher
   * GET /api/classes/teacher/:teacherId/students
   */
  getTeacherStudents: (req, res) => {
    const { teacherId } = req.params;

    Enrollment.getStudentsByTeacherId(teacherId, (err, results) => {
      if (err) {
        console.error('Error fetching teacher students:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching students',
          error: err.message
        });
      }

      res.json({
        success: true,
        data: results || []
      });
    });
  },

  /**
   * Get class details with enrollment info
   * GET /api/classes/:id
   */
  getClassDetails: (req, res) => {
    const classId = req.params.id;

    const query = `
      SELECT c.*, 
             u.name as teacher_name, u.email as teacher_email,
             COUNT(DISTINCT e.student_id) as enrolled_count
      FROM classes c
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON c.id = e.class_id
      WHERE c.id = ?
      GROUP BY c.id
    `;

    db.query(query, [classId], (err, results) => {
      if (err) {
        console.error('Error fetching class details:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching class details',
          error: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      res.json({
        success: true,
        data: results[0]
      });
    });
  },

  /**
   * Get enrolled students for a class
   * GET /api/classes/:id/students
   */
  getClassStudents: (req, res) => {
    const classId = req.params.id;

    Enrollment.getByClassId(classId, (err, results) => {
      if (err) {
        console.error('Error fetching class students:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching enrolled students',
          error: err.message
        });
      }

      res.json({
        success: true,
        data: results || []
      });
    });
  },

  /**
   * Student: Enroll in a class
   * POST /api/student/enroll/:classId
   */
  enrollStudent: (req, res) => {
    const classId = req.params.classId;
    const studentId = req.user.id;

    // Check if already enrolled
    Enrollment.isEnrolled(classId, studentId, (err, enrollment) => {
      if (err) {
        console.error('Error checking enrollment:', err);
        return res.status(500).json({
          success: false,
          message: 'Error during enrollment',
          error: err.message
        });
      }

      if (enrollment && enrollment.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You are already enrolled in this class'
        });
      }

      // Create enrollment
      Enrollment.create(classId, studentId, (err, result) => {
        if (err) {
          console.error('Error creating enrollment:', err);
          return res.status(500).json({
            success: false,
            message: 'Error enrolling in class',
            error: err.message
          });
        }

        // Mark attendance automatically
        const attendanceQuery = 'INSERT INTO attendance (student_id, class_id) VALUES (?, ?)';
        db.query(attendanceQuery, [studentId, classId], (err) => {
          if (err) {
            console.error('Error marking attendance:', err);
            // Don't fail enrollment if attendance fails
          }

          // Get class details for notification
          const classQuery = 'SELECT title FROM classes WHERE id = ?';
          db.query(classQuery, [classId], (err, classResults) => {
            const className = classResults && classResults.length > 0 ? classResults[0].title : 'Class';

            // Create notification
            Notification.create(
              studentId,
              `You have successfully enrolled in "${className}"`,
              'enrollment_confirmation',
              classId,
              (err) => {
                if (err) {
                  console.error('Error creating notification:', err);
                }
              }
            );

            res.status(201).json({
              success: true,
              message: 'Successfully enrolled in class',
              data: {
                enrollment_id: result.insertId,
                class_id: classId
              }
            });
          });
        });
      });
    });
  },

  /**
   * Student: Get my enrolled classes
   * GET /api/student/classes
   */
  getStudentClasses: (req, res) => {
    const studentId = req.user.id;

    Enrollment.getByStudentId(studentId, (err, results) => {
      if (err) {
        console.error('Error fetching student classes:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching your classes',
          error: err.message
        });
      }

      res.json({
        success: true,
        data: results || []
      });
    });
  },

  /**
   * Student: Unenroll from class
   * DELETE /api/student/classes/:classId
   */
  unenrollStudent: (req, res) => {
    const classId = req.params.classId;
    const studentId = req.user.id;

    Enrollment.remove(classId, studentId, (err, result) => {
      if (err) {
        console.error('Error removing enrollment:', err);
        return res.status(500).json({
          success: false,
          message: 'Error unenrolling from class',
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      res.json({
        success: true,
        message: 'Successfully unenrolled from class'
      });
    });
  }
};

module.exports = classController;
