const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { enrollStudentInTeacherClasses, enrollAllStudentsOfTeacher } = require('../utils/autoEnrollment');

const adminController = {
  // Get all teachers
  getTeachers: (req, res) => {
    User.getAllByRole('teacher', (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json(results);
    });
  },

  // Get teacher by ID
  getTeacherById: (req, res) => {
    const { id } = req.params;
    
    User.findById(id, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      
      const teacher = results[0];
      if (teacher.role !== 'teacher') {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      
      res.json(teacher);
    });
  },

  // Add teacher
  addTeacher: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all fields' });
      }

      // Check if user already exists
      User.findByEmail(email, async (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length > 0) {
          return res.status(400).json({ message: 'Teacher already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
          name,
          email,
          password: hashedPassword,
          role: 'teacher'
        };

        User.create(userData, (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error creating teacher', error: err });
          }

          res.status(201).json({
            message: 'Teacher created successfully',
            teacherId: result.insertId
          });
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Update teacher
  updateTeacher: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;

      if (!name || !email) {
        return res.status(400).json({ message: 'Please provide name and email' });
      }

      User.findById(id, async (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: 'Teacher not found' });
        }

        const updateData = { name, email };

        if (password) {
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(password, salt);
        }

        const query = 'UPDATE users SET ? WHERE id = ?';
        User.updateById(id, updateData, (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error updating teacher', error: err });
          }

          res.json({ message: 'Teacher updated successfully' });
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Get all students
  getStudents: (req, res) => {
    User.getAllByRole('student', (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json(results);
    });
  },

  // Get student by ID
  getStudentById: (req, res) => {
    const { id } = req.params;
    
    const query = `
      SELECT s.id, s.name, s.email, s.phone, s.course_name, s.teacher_id, s.role, s.created_at,
             t.name as teacher_name
      FROM users s
      LEFT JOIN users t ON s.teacher_id = t.id AND t.role = 'teacher'
      WHERE s.id = ? AND s.role = 'student'
    `;
    
    const db = require('../config/db');
    db.query(query, [id], (err, results) => {
      if (err && err.code === 'ER_BAD_FIELD_ERROR') {
        const fallbackQuery = `
          SELECT id, name, email, role, created_at,
                 NULL AS phone, NULL AS course_name, NULL AS teacher_id, NULL AS teacher_name
          FROM users
          WHERE id = ? AND role = 'student'
        `;
        return db.query(fallbackQuery, [id], (fallbackErr, fallbackResults) => {
          if (fallbackErr) {
            return res.status(500).json({ message: 'Database error', error: fallbackErr });
          }

          if (fallbackResults.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
          }

          return res.json(fallbackResults[0]);
        });
      }

      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      res.json(results[0]);
    });
  },

  // Add student
  addStudent: async (req, res) => {
    try {
      const { name, email, password, phone, course_name, teacher_id } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
      }

      if (!teacher_id) {
        return res.status(400).json({ message: 'Please assign a teacher' });
      }

      // Check if user already exists
      User.findByEmail(email, async (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length > 0) {
          return res.status(400).json({ message: 'Student already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
          course_name: course_name || null,
          teacher_id: teacher_id || null,
          role: 'student'
        };

        User.create(userData, async (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error creating student', error: err });
          }

          // Auto-enroll student in teacher's classes
          const studentId = result.insertId;
          if (teacher_id) {
            try {
              await enrollStudentInTeacherClasses(studentId);
              console.log(`✅ Auto-enrolled student ${studentId} in teacher's classes`);
            } catch (autoEnrollErr) {
              console.error('Auto-enrollment warning:', autoEnrollErr);
            }
          }

          res.status(201).json({
            message: 'Student created successfully',
            studentId: result.insertId
          });
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Update student
  updateStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, password, phone, course_name, teacher_id } = req.body;

      if (!name || !email) {
        return res.status(400).json({ message: 'Please provide name and email' });
      }

      User.findById(id, async (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: 'Student not found' });
        }

        const updateData = {
          name,
          email,
          phone: phone || null,
          course_name: course_name || null,
          teacher_id: teacher_id || null
        };

        if (password) {
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(password, salt);
        }

        User.updateById(id, updateData, async (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error updating student', error: err });
          }

          // Auto-enroll if teacher changed
          if (teacher_id) {
            try {
              await enrollStudentInTeacherClasses(id);
              console.log(`✅ Auto-enrolled student ${id} in updated teacher's classes`);
            } catch (autoEnrollErr) {
              console.error('Auto-enrollment warning:', autoEnrollErr);
            }
          }

          res.json({ message: 'Student updated successfully' });
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Get all classes
  getClasses: (req, res) => {
    Class.getAll((err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json(results);
    });
  },

  // Create class (Admin)
  createClass: (req, res) => {
    try {
      const { title, description, date, teacher_id, student_ids } = req.body;

      if (!title || !date || !teacher_id) {
        return res.status(400).json({ message: 'Please provide title, date and teacher' });
      }

      // Generate unique roomId
      const roomId = `room-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

      const classData = {
        title,
        description: description || '',
        date,
        roomId,
        teacher_id
      };

      Class.create(classData, async (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error creating class', error: err });
        }

        const classId = result.insertId;
        
        // Auto-enroll all teacher's students in this new class
        try {
          await enrollAllStudentsOfTeacher(teacher_id);
          console.log(`✅ Auto-enrolled teacher's students in new class ${classId}`);
        } catch (autoEnrollErr) {
          console.error('Auto-enrollment warning:', autoEnrollErr);
        }

        // Enroll students if provided
        if (student_ids && Array.isArray(student_ids) && student_ids.length > 0) {
          Class.enrollStudents(classId, student_ids, (enrollErr) => {
            if (enrollErr) {
              console.error('Error enrolling students:', enrollErr);
              // Class created but student enrollment failed
              return res.status(201).json({
                message: 'Class created but some students could not be enrolled',
                classId: classId,
                roomId: roomId,
                warning: 'Student enrollment partially failed'
              });
            }

            res.status(201).json({
              message: 'Class created and students enrolled successfully',
              classId: classId,
              roomId: roomId,
              studentsEnrolled: student_ids.length
            });
          });
        } else {
          // No students to enroll
          res.status(201).json({
            message: 'Class created successfully',
            classId: classId,
            roomId: roomId
          });
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Delete class
  deleteClass: (req, res) => {
    const { id } = req.params;

    Class.deleteById(id, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Class not found' });
      }

      res.json({ message: 'Class deleted successfully' });
    });
  },

  // Delete teacher
  deleteTeacher: (req, res) => {
    const { id } = req.params;
    const db = require('../config/db');

    console.log(`[DELETE TEACHER] Attempting to delete teacher ID: ${id}`);

    // First check if teacher has any students assigned
    const checkStudentsQuery = 'SELECT COUNT(*) as count FROM users WHERE teacher_id = ? AND role = "student"';
    db.query(checkStudentsQuery, [id], (err, studentResults) => {
      if (err) {
        console.error(`[DELETE TEACHER] Error checking students for teacher ${id}:`, err);
        return res.status(500).json({ message: 'Database error checking students', error: err.message });
      }

      const studentCount = studentResults[0].count;
      if (studentCount > 0) {
        console.log(`[DELETE TEACHER] Teacher ${id} has ${studentCount} student(s) assigned - blocking deletion`);
        return res.status(400).json({ 
          message: `Cannot delete teacher. ${studentCount} student(s) are assigned to this teacher. Please reassign or delete them first.` 
        });
      }

      // Check if teacher has any assignments
      const checkAssignmentsQuery = 'SELECT COUNT(*) as count FROM assignments WHERE teacher_id = ?';
      db.query(checkAssignmentsQuery, [id], (err, assignmentResults) => {
        if (err) {
          console.error(`[DELETE TEACHER] Error checking assignments for teacher ${id}:`, err);
          return res.status(500).json({ message: 'Database error checking assignments', error: err.message });
        }

        const assignmentCount = assignmentResults[0]?.count || 0;
        if (assignmentCount > 0) {
          console.log(`[DELETE TEACHER] Teacher ${id} has ${assignmentCount} assignment(s) - blocking deletion`);
          return res.status(400).json({ 
            message: `Cannot delete teacher. Teacher has ${assignmentCount} assignment(s). Please delete them first.` 
          });
        }

        console.log(`[DELETE TEACHER] Teacher ${id} has no students or assignments - proceeding with deletion`);

        // If no students or assignments, delete the teacher (classes will cascade delete)
        User.deleteById(id, (err, result) => {
          if (err) {
            console.error(`[DELETE TEACHER] Error deleting teacher ${id}:`, err);
            if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
              return res.status(400).json({ 
                message: 'Cannot delete teacher. Teacher has related records that must be removed first.' 
              });
            }
            return res.status(500).json({ message: 'Database error deleting teacher', error: err.message });
          }

          if (result.affectedRows === 0) {
            console.log(`[DELETE TEACHER] Teacher ${id} not found`);
            return res.status(404).json({ message: 'Teacher not found' });
          }

          console.log(`[DELETE TEACHER] Successfully deleted teacher ${id}`);
          res.json({ message: 'Teacher deleted successfully' });
        });
      });
    });
  },

  // Delete student
  deleteStudent: (req, res) => {
    const { id } = req.params;
    const db = require('../config/db');

    console.log(`[DELETE STUDENT] Attempting to delete student ID: ${id}`);

    const checkUserQuery = 'SELECT id, role FROM users WHERE id = ?';
    db.query(checkUserQuery, [id], (err, userResults) => {
      if (err) {
        console.error(`[DELETE STUDENT] Error checking user ${id}:`, err);
        return res.status(500).json({ message: 'Database error checking user', error: err.message });
      }

      if (!userResults || userResults.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      if (userResults[0].role !== 'student') {
        return res.status(400).json({
          message: 'Selected user is not a student. Please delete from the correct module.'
        });
      }

      const checkOwnedAssignmentsQuery = 'SELECT COUNT(*) AS count FROM assignments WHERE teacher_id = ?';
      db.query(checkOwnedAssignmentsQuery, [id], (err, assignmentOwnerResults) => {
        if (err) {
          console.error(`[DELETE STUDENT] Error checking assignments owned by user ${id}:`, err);
          return res.status(500).json({ message: 'Database error checking related assignments', error: err.message });
        }

        const assignmentOwnerCount = assignmentOwnerResults[0]?.count || 0;
        if (assignmentOwnerCount > 0) {
          return res.status(400).json({
            message: `Cannot delete this user as student. User is referenced as assignment owner in ${assignmentOwnerCount} assignment(s).`
          });
        }

        // Remove student from assignment_students first (if table exists)
        const deleteAssignmentStudentsQuery = 'DELETE FROM assignment_students WHERE student_id = ?';
        db.query(deleteAssignmentStudentsQuery, [id], (err, assignmentStudentResult) => {
          if (err && err.code !== 'ER_NO_SUCH_TABLE') {
            console.error(`[DELETE STUDENT] Error removing assignment_students for student ${id}:`, err);
            return res.status(500).json({ message: 'Error removing assignment assignments', error: err.message });
          }

          console.log(`[DELETE STUDENT] Removed ${assignmentStudentResult?.affectedRows || 0} assignment assignment(s) for student ${id}`);

          // Remove student from class enrollments
          const deleteEnrollmentsQuery = 'DELETE FROM class_students WHERE student_id = ?';
          db.query(deleteEnrollmentsQuery, [id], (err, enrollResult) => {
            if (err) {
              console.error(`[DELETE STUDENT] Error removing class enrollments for student ${id}:`, err);
              return res.status(500).json({ message: 'Error removing class enrollments', error: err.message });
            }

            console.log(`[DELETE STUDENT] Removed ${enrollResult.affectedRows} enrollment(s) for student ${id}`);

            // Delete student (submissions and attendance may or may not cascade based on schema)
            User.deleteById(id, (err, result) => {
              if (err) {
                console.error(`[DELETE STUDENT] Error deleting student ${id}:`, err);
                if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
                  return res.status(400).json({
                    message: 'Cannot delete student. Student has related records that must be removed first.'
                  });
                }
                return res.status(500).json({ message: 'Database error deleting student', error: err.message });
              }

              if (result.affectedRows === 0) {
                console.log(`[DELETE STUDENT] Student ${id} not found`);
                return res.status(404).json({ message: 'Student not found' });
              }

              console.log(`[DELETE STUDENT] Successfully deleted student ${id}`);
              res.json({ message: 'Student deleted successfully' });
            });
          });
        });
      });
    });
  },

  // Get all attendance report
  getAttendanceReport: (req, res) => {
    try {
      Attendance.getAllAttendanceReport((err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching attendance report', error: err });
        }

        // Format the response
        const report = results.map(record => ({
          id: record.id,
          studentName: record.student_name,
          studentEmail: record.student_email,
          classTitle: record.class_title,
          classDate: record.class_date,
          teacherName: record.teacher_name,
          teacherEmail: record.teacher_email,
          status: record.status,
          joinTime: record.join_time,
          leaveTime: record.leave_time
        }));

        res.json({
          message: 'Attendance report retrieved successfully',
          totalRecords: report.length,
          data: report
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // GET /api/admin/messages - Admin message monitoring
  getAllMessages: async (req, res) => {
    try {
      const Message = require('../models/Message');
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      if (limit < 1 || limit > 200) {
        return res.status(400).json({ message: 'Limit must be between 1 and 200' });
      }

      if (offset < 0) {
        return res.status(400).json({ message: 'Offset must be non-negative' });
      }

      const [messages, total] = await Promise.all([
        Message.getAllMessages({ limit, offset }),
        Message.getTotalCount()
      ]);

      res.json({
        message: 'Messages retrieved successfully',
        data: messages,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      });
    } catch (error) {
      console.error('Error fetching messages for admin:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = adminController;
