const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');

exports.enrollStudent = (req, res) => {
  const { classId } = req.params;
  const studentId = req.user.id;

  // Check if already enrolled
  Enrollment.checkEnrollment(classId, studentId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    if (results.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this class' });
    }

    // Enroll the student
    Enrollment.enroll(classId, studentId, (err) => {
      if (err) return res.status(500).json({ message: 'Enrollment failed', error: err });

      // Automatically mark attendance
      const attendanceData = {
        student_id: studentId,
        class_id: classId,
        joined_at: new Date()
      };
      
      Attendance.markPresent(attendanceData, (err) => {
        if (err) console.log('Attendance marking failed:', err);

        // Create enrollment confirmation notification
        const notification = {
          user_id: studentId,
          class_id: classId,
          message: 'You have successfully enrolled in a new class!',
          notification_type: 'enrollment_confirmation'
        };
        
        Notification.create(notification, (err) => {
          if (err) console.log('Notification creation failed:', err);
          res.status(200).json({ message: 'Successfully enrolled in the class' });
        });
      });
    });
  });
};

exports.getStudentClasses = (req, res) => {
  const studentId = req.user.id;

  Enrollment.getStudentClasses(studentId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results);
  });
};

exports.getClassEnrollments = (req, res) => {
  const { classId } = req.params;

  Enrollment.getEnrollments(classId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results);
  });
};

exports.unenrollStudent = (req, res) => {
  const { classId } = req.params;
  const studentId = req.user.id;

  Enrollment.unenroll(classId, studentId, (err) => {
    if (err) return res.status(500).json({ message: 'Unenrollment failed', error: err });
    res.status(200).json({ message: 'Successfully unenrolled from the class' });
  });
};
