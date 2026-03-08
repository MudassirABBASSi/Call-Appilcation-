const db = require('../config/db');

const Course = {
  create: (courseData, callback) => {
    const query = `
      INSERT INTO courses (name, description, teacher_id) 
      VALUES (?, ?, ?)
    `;
    db.query(query, [courseData.name, courseData.description || '', courseData.teacher_id], callback);
  },

  getAll: (callback) => {
    const query = `
      SELECT c.*, 
             u.name as teacher_name,
             COUNT(DISTINCT ce.student_id) as enrollment_count
      FROM courses c
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN course_enrollments ce ON c.id = ce.course_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    db.query(query, callback);
  },

  getById: (id, callback) => {
    const query = `
      SELECT c.*, 
             u.name as teacher_name,
             COUNT(DISTINCT ce.student_id) as enrollment_count
      FROM courses c
      JOIN users u ON c.teacher_id = u.id
      LEFT JOIN course_enrollments ce ON c.id = ce.course_id
      WHERE c.id = ?
      GROUP BY c.id
    `;
    db.query(query, [id], callback);
  },

  getByTeacherId: (teacherId, callback) => {
    const query = `
      SELECT c.*, 
             COUNT(DISTINCT ce.student_id) as enrollment_count
      FROM courses c
      LEFT JOIN course_enrollments ce ON c.id = ce.course_id
      WHERE c.teacher_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    db.query(query, [teacherId], callback);
  },

  getByStudentId: (studentId, callback) => {
    const query = `
      SELECT c.*, 
             u.name as teacher_name
      FROM courses c
      JOIN users u ON c.teacher_id = u.id
      JOIN course_enrollments ce ON c.id = ce.course_id
      WHERE ce.student_id = ?
      ORDER BY c.created_at DESC
    `;
    db.query(query, [studentId], callback);
  },

  update: (id, courseData, callback) => {
    const query = `
      UPDATE courses 
      SET name = ?, description = ?
      WHERE id = ?
    `;
    db.query(query, [courseData.name, courseData.description, id], callback);
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM courses WHERE id = ?';
    db.query(query, [id], callback);
  },

  enrollStudent: (courseId, studentId, callback) => {
    const query = `
      INSERT INTO course_enrollments (course_id, student_id) 
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE enrolled_at = NOW()
    `;
    db.query(query, [courseId, studentId], callback);
  },

  unenrollStudent: (courseId, studentId, callback) => {
    const query = 'DELETE FROM course_enrollments WHERE course_id = ? AND student_id = ?';
    db.query(query, [courseId, studentId], callback);
  },

  getEnrolledStudents: (courseId, callback) => {
    const query = `
      SELECT u.id, u.name, u.email, u.role
      FROM users u
      JOIN course_enrollments ce ON u.id = ce.student_id
      WHERE ce.course_id = ? AND u.role = 'student'
      ORDER BY u.name ASC
    `;
    db.query(query, [courseId], callback);
  },

  checkEnrollment: (courseId, studentId, callback) => {
    const query = 'SELECT id FROM course_enrollments WHERE course_id = ? AND student_id = ?';
    db.query(query, [courseId, studentId], callback);
  }
};

module.exports = Course;
