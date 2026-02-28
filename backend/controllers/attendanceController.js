const Attendance = require('../models/Attendance');

const attendanceController = {
  // Mark student as present
  markPresent: (req, res) => {
    try {
      const { classId, studentId } = req.body;
      const joinTime = new Date();

      if (!classId || !studentId) {
        return res.status(400).json({ message: 'classId and studentId are required' });
      }

      Attendance.markPresent(classId, studentId, joinTime, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error marking attendance', error: err });
        }

        res.json({
          message: 'Student marked as present',
          studentId,
          classId,
          joinTime
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Mark student as absent
  markAbsent: (req, res) => {
    try {
      const { classId, studentId } = req.body;

      if (!classId || !studentId) {
        return res.status(400).json({ message: 'classId and studentId are required' });
      }

      Attendance.markAbsent(classId, studentId, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error marking absence', error: err });
        }

        res.json({
          message: 'Student marked as absent',
          studentId,
          classId
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Record leave time
  recordLeaveTime: (req, res) => {
    try {
      const { classId, studentId } = req.body;
      const leaveTime = new Date();

      if (!classId || !studentId) {
        return res.status(400).json({ message: 'classId and studentId are required' });
      }

      Attendance.recordLeaveTime(classId, studentId, leaveTime, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error recording leave time', error: err });
        }

        res.json({
          message: 'Leave time recorded',
          studentId,
          classId,
          leaveTime
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Get class attendance
  getClassAttendance: (req, res) => {
    try {
      const { classId } = req.params;

      if (!classId) {
        return res.status(400).json({ message: 'classId is required' });
      }

      Attendance.getClassAttendance(classId, (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching attendance', error: err });
        }

        res.json(results);
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Get student attendance
  getStudentAttendance: (req, res) => {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        return res.status(400).json({ message: 'studentId is required' });
      }

      Attendance.getStudentAttendance(studentId, (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching attendance', error: err });
        }

        res.json(results);
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Get attendance record
  getAttendanceRecord: (req, res) => {
    try {
      const { classId, studentId } = req.params;

      if (!classId || !studentId) {
        return res.status(400).json({ message: 'classId and studentId are required' });
      }

      Attendance.getAttendanceRecord(classId, studentId, (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching record', error: err });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.json(results[0]);
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Get attendance statistics for a class
  getAttendanceStats: (req, res) => {
    try {
      const { classId } = req.params;

      if (!classId) {
        return res.status(400).json({ message: 'classId is required' });
      }

      Attendance.getAttendanceStats(classId, (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching stats', error: err });
        }

        res.json(results[0] || { total_students: 0, present_count: 0, absent_count: 0, attendance_percentage: 0 });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Get student attendance percentage
  getStudentAttendancePercentage: (req, res) => {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        return res.status(400).json({ message: 'studentId is required' });
      }

      Attendance.getStudentAttendancePercentage(studentId, (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching percentage', error: err });
        }

        res.json(results[0] || { total_classes: 0, present_count: 0, attendance_percentage: 0 });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Update attendance status
  updateAttendanceStatus: (req, res) => {
    try {
      const { classId, studentId } = req.params;
      const { status } = req.body;

      if (!classId || !studentId) {
        return res.status(400).json({ message: 'classId and studentId are required' });
      }

      if (!status || !['present', 'absent'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be "present" or "absent"' });
      }

      Attendance.updateStatus(classId, studentId, status, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating attendance', error: err });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.json({
          message: 'Attendance status updated',
          classId,
          studentId,
          status
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Delete attendance record
  deleteAttendance: (req, res) => {
    try {
      const { classId, studentId } = req.params;

      if (!classId || !studentId) {
        return res.status(400).json({ message: 'classId and studentId are required' });
      }

      Attendance.deleteAttendance(classId, studentId, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error deleting attendance', error: err });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.json({ message: 'Attendance record deleted' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  },

  // Get student class history
  getStudentClassHistory: (req, res) => {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        return res.status(400).json({ message: 'studentId is required' });
      }

      Attendance.getStudentClassHistory(studentId, (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching class history', error: err });
        }

        res.json(results);
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }
};

module.exports = attendanceController;
