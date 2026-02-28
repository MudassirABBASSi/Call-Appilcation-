const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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

        User.create(userData, (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error creating student', error: err });
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

        User.updateById(id, updateData, (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error updating student', error: err });
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

      Class.create(classData, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error creating class', error: err });
        }

        const classId = result.insertId;

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

    User.deleteById(id, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      res.json({ message: 'Teacher deleted successfully' });
    });
  },

  // Delete student
  deleteStudent: (req, res) => {
    const { id } = req.params;

    User.deleteById(id, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json({ message: 'Student deleted successfully' });
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
  }
};

module.exports = adminController;
