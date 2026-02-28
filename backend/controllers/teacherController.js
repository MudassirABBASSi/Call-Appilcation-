const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const crypto = require('crypto');

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

      Class.create(classData, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error creating class', error: err });
        }

        res.status(201).json({
          message: 'Class created successfully',
          classId: result.insertId,
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
