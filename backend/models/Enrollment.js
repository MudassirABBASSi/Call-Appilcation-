const db = require('../config/db');

const Enrollment = {
  // Enroll a student in a class
  enroll: (classId, studentId, callback) => {
    const query = `
      INSERT INTO enrollments (class_id, student_id, enrolled_at)
      VALUES (?, ?, NOW())
    `;
    db.query(query, [classId, studentId], callback);
  },

  // Check if student is enrolled
  checkEnrollment: (classId, studentId, callback) => {
    const query = `
      SELECT id FROM enrollments 
      WHERE class_id = ? AND student_id = ?
    `;
    db.query(query, [classId, studentId], callback);
  },

  // Get student's enrolled classes
  getStudentClasses: (studentId, callback) => {
    const query = `
      SELECT c.*, 
             u.name as teacher_name,
             e.enrolled_at,
             (SELECT COUNT(*) FROM enrollments WHERE class_id = c.id) as enrollment_count
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE e.student_id = ? AND c.is_active = TRUE
      ORDER BY c.start_time ASC
    `;
    db.query(query, [studentId], callback);
  },

  // Get class enrollment list
  getEnrollments: (classId, callback) => {
    const query = `
      SELECT u.id, u.name, u.email, e.enrolled_at
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.class_id = ?
      ORDER BY e.enrolled_at DESC
    `;
    db.query(query, [classId], callback);
  },

  // Unenroll a student
  unenroll: (classId, studentId, callback) => {
    const query = `
      DELETE FROM enrollments 
      WHERE class_id = ? AND student_id = ?
    `;
    db.query(query, [classId, studentId], callback);
  },

  // Get count of enrollments for a class
  getEnrollmentCount: (classId, callback) => {
    const query = `
      SELECT COUNT(*) as count FROM enrollments 
      WHERE class_id = ?
    `;
    db.query(query, [classId], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].count);
    });
  }
};

module.exports = Enrollment;
