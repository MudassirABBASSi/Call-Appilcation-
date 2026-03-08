const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const crypto = require('crypto');
const db = require('../config/db');
const { enrollAllStudentsOfTeacher } = require('../utils/autoEnrollment');
const notificationHelper = require('../utils/notificationHelper');

const teacherController = {
  // Create class
  createClass: (req, res) => {
    try {
      const { title, description, date } = req.body;
      const teacherId = req.user.id;

      if (!title || !date) {
        return res.status(400).json({ message: 'Please provide title and date' });
      }

      // Generate unique roomId
      const roomId = `room-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

      const classData = {
        title,
        description: description || '',
        date,
        roomId,
        teacher_id: teacherId
      };

      Class.create(classData, async (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error creating class', error: err });
        }

        const classId = result.insertId;
        
          // Auto-enroll ALL students in this new class (not just teacher's assigned students)
        try {
            const studentsQuery = 'SELECT id FROM users WHERE role = "student"';
            const students = await new Promise((resolve, reject) => {
              db.query(studentsQuery, (err, results) => {
                if (err) reject(err);
                resolve(results || []);
              });
            });

            let enrolled = 0;
            for (const student of students) {
              try {
                await new Promise((resolve, reject) => {
                  db.query(
                    'INSERT INTO class_students (class_id, student_id) VALUES (?, ?)',
                    [classId, student.id],
                    (err) => {
                      if (err && err.code !== 'ER_DUP_ENTRY') reject(err);
                      resolve();
                    }
                  );
                });
                enrolled++;
              } catch (err) {
                // Skip if already enrolled
                if (err.code !== 'ER_DUP_ENTRY') {
                  console.error(`Error enrolling student ${student.id}:`, err.message);
                }
              }
            }
            console.log(`✅ Auto-enrolled ${enrolled} student(s) in new class ${classId}`);
            
            // Send notifications to enrolled students
            try {
              const teacherName = req.user.name || 'Teacher';
              await notificationHelper.notifyNewClass(
                classId,
                title,
                teacherName,
                new Date(date)
              );
              console.log(`✅ Sent ${enrolled} notification(s) for new class`);
            } catch (notifErr) {
              console.error('Notification warning:', notifErr);
            }
        } catch (autoEnrollErr) {
          console.error('Auto-enrollment warning:', autoEnrollErr);
        }

        res.status(201).json({
          message: 'Class created successfully',
          classId: classId,
          roomId: roomId
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Get teacher's classes
  getMyClasses: (req, res) => {
    const teacherId = req.user.id;

    Class.getByTeacherId(teacherId, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json(results);
    });
  },

  // Get students assigned to teacher
  getMyStudents: (req, res) => {
    const teacherId = req.user.id;

    User.getStudentsByTeacherId(teacherId, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json(results || []);
    });
  },

  // Get class-student mappings for teacher's classes
  getClassStudents: (req, res) => {
    const teacherId = req.user.id;

    const query = `
      SELECT cs.class_id, cs.student_id, c.title as class_title, u.name as student_name
      FROM class_students cs
      JOIN classes c ON cs.class_id = c.id
      JOIN users u ON cs.student_id = u.id
      WHERE c.teacher_id = ? AND u.role = 'student'
      ORDER BY u.name ASC, c.title ASC
    `;

    db.query(query, [teacherId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      res.json(results || []);
    });
  },

  // Get attendance for a class
  getAttendance: (req, res) => {
    const { classId } = req.params;

    Attendance.getByClassId(classId, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json(results);
    });
  },

  // Get attendance report for teacher's classes
  getAttendanceReport: (req, res) => {
    try {
      const teacherId = req.user.id;

      Attendance.getTeacherAttendanceReport(teacherId, (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching attendance report', error: err });
        }

        // Format the response
        const report = results.map(record => ({
          id: record.id,
          classId: record.class_id,
          studentId: record.student_id,
          studentName: record.student_name,
          studentEmail: record.student_email,
          classTitle: record.class_title,
          classDate: record.class_date,
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

module.exports = teacherController;
