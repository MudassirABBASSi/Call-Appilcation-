const Class = require('../models/Class');
const Attendance = require('../models/Attendance');

const studentController = {
  // Get upcoming classes
  getClasses: (req, res) => {
    Class.getUpcoming((err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json(results);
    });
  },

  // Join class (mark attendance)
  joinClass: (req, res) => {
    try {
      const { classId } = req.params;
      const studentId = req.user.id;

      if (!classId || !studentId) {
        return res.status(400).json({ message: 'classId and studentId are required' });
      }

      // Check if attendance record already exists
      Attendance.getAttendanceRecord(classId, studentId, (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length > 0) {
          // Record already exists - just return class info and current attendance status
          Class.findById(classId, (err, classResults) => {
            if (err) {
              return res.status(500).json({ message: 'Database error', error: err });
            }

            if (classResults.length === 0) {
              return res.status(404).json({ message: 'Class not found' });
            }

            return res.json({
              message: 'Already joined this class',
              status: results[0].status,
              joinTime: results[0].join_time,
              roomId: classResults[0].roomId,
              alreadyMarked: true
            });
          });
        } else {
          // Create new attendance record with status='present' and join_time
          const joinTime = new Date();
          Attendance.markPresent(classId, studentId, joinTime, (err, result) => {
            if (err) {
              return res.status(500).json({ message: 'Error marking attendance', error: err });
            }

            // Get class info
            Class.findById(classId, (err, classResults) => {
              if (err) {
                return res.status(500).json({ message: 'Database error', error: err });
              }

              if (classResults.length === 0) {
                return res.status(404).json({ message: 'Class not found' });
              }

              res.status(200).json({
                message: 'Attendance marked successfully - student is present',
                studentId,
                classId,
                status: 'present',
                joinTime,
                roomId: classResults[0].roomId,
                alreadyMarked: false
              });
            });
          });
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }
};

module.exports = studentController;
