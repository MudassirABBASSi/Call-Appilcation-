const db = require('../config/db');

const Enrollment = {
  // Create enrollment (student enrolls in class)
  create: (classId, studentId, callback) => {
    const query = 'INSERT INTO enrollments (class_id, student_id) VALUES (?, ?)';
    db.query(query, [classId, studentId], callback);
  },

  // Get all students enrolled in a class
  getByClassId: (classId, callback) => {
    const query = `
      SELECT u.id, u.name, u.email, u.phone, u.course_name, e.enrolled_at
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.class_id = ?
      ORDER BY e.enrolled_at DESC
    `;
    db.query(query, [classId], callback);
  },

  // Get all classes a student is enrolled in
  getByStudentId: (studentId, callback) => {
    const query = `
      SELECT c.*, u.name as teacher_name, 
             COUNT(DISTINCT e2.student_id) as enrolled_count
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e2 ON c.id = e2.class_id
      WHERE e.student_id = ?
      GROUP BY c.id
      ORDER BY c.date DESC
    `;
    db.query(query, [studentId], callback);
  },

  // Check if student is enrolled in class
  isEnrolled: (classId, studentId, callback) => {
    const query = 'SELECT id FROM enrollments WHERE class_id = ? AND student_id = ?';
    db.query(query, [classId, studentId], callback);
  },

  // Remove enrollment
  remove: (classId, studentId, callback) => {
    const query = 'DELETE FROM enrollments WHERE class_id = ? AND student_id = ?';
    db.query(query, [classId, studentId], callback);
  },

  // Get enrollment count for a class
  getEnrollmentCount: (classId, callback) => {
    const query = 'SELECT COUNT(*) as count FROM enrollments WHERE class_id = ?';
    db.query(query, [classId], callback);
  },

  // Get students assigned to a teacher (for enrollment display)
  getStudentsByTeacherId: (teacherId, callback) => {
    const query = `
      SELECT DISTINCT u.id, u.name, u.email, u.phone, u.course_name
      FROM users u
      WHERE u.teacher_id = ? AND u.role = 'student'
      ORDER BY u.name ASC
    `;
    db.query(query, [teacherId], callback);
  }
};

module.exports = Enrollment;
