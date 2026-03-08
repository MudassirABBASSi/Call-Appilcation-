const db = require('../config/db');

const CourseAssignment = {
  create: (assignmentData, callback) => {
    const query = `
      INSERT INTO assignments (title, description, file_url, total_marks, due_date, day_of_week, course_id, teacher_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [
      assignmentData.title,
      assignmentData.description || '',
      assignmentData.file_url || null,
      assignmentData.total_marks || 100,
      assignmentData.due_date,
      assignmentData.day_of_week || null,
      assignmentData.course_id,
      assignmentData.teacher_id
    ], callback);
  },

  getAll: (callback) => {
    const query = `
      SELECT a.*, 
             c.name as course_name,
             u.name as teacher_name,
             COUNT(DISTINCT s.id) as submissions_count
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN users u ON a.teacher_id = u.id
      LEFT JOIN submissions s ON a.id = s.assignment_id
      GROUP BY a.id
      ORDER BY a.due_date DESC
    `;
    db.query(query, callback);
  },

  getById: (id, callback) => {
    const query = `
      SELECT a.*, 
             c.name as course_name,
             u.name as teacher_name
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN users u ON a.teacher_id = u.id
      WHERE a.id = ?
    `;
    db.query(query, [id], callback);
  },

  getByCourseId: (courseId, callback) => {
    const query = `
      SELECT a.*, 
             c.name as course_name,
             u.name as teacher_name,
             COUNT(DISTINCT s.id) as submissions_count
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN users u ON a.teacher_id = u.id
      LEFT JOIN submissions s ON a.id = s.assignment_id
      WHERE a.course_id = ?
      GROUP BY a.id
      ORDER BY a.due_date DESC
    `;
    db.query(query, [courseId], callback);
  },

  getByTeacherId: (teacherId, callback) => {
    const query = `
      SELECT a.*, 
             c.name as course_name,
             COUNT(DISTINCT s.id) as submissions_count
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      LEFT JOIN submissions s ON a.id = s.assignment_id
      WHERE a.teacher_id = ?
      GROUP BY a.id
      ORDER BY a.due_date DESC
    `;
    db.query(query, [teacherId], callback);
  },

  getForStudent: (studentId, callback) => {
    const query = `
      SELECT a.*, 
             c.name as course_name,
             u.name as teacher_name,
             s.id as submission_id,
             s.submitted_at,
             s.marks_obtained,
             s.feedback,
             s.graded,
             s.file_url as submission_file_url
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN users u ON a.teacher_id = u.id
      JOIN course_enrollments ce ON a.course_id = ce.course_id
      LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
      WHERE ce.student_id = ? AND u.role = 'teacher'
      ORDER BY a.due_date DESC
    `;
    db.query(query, [studentId, studentId], callback);
  },

  update: (id, assignmentData, callback) => {
    const query = `
      UPDATE assignments 
      SET title = ?, description = ?, file_url = ?, total_marks = ?, due_date = ?, day_of_week = ?
      WHERE id = ?
    `;
    db.query(query, [
      assignmentData.title,
      assignmentData.description,
      assignmentData.file_url,
      assignmentData.total_marks,
      assignmentData.due_date,
      assignmentData.day_of_week,
      id
    ], callback);
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM assignments WHERE id = ?';
    db.query(query, [id], callback);
  },

  getSubmissions: (assignmentId, callback) => {
    const query = `
      SELECT s.*, 
             u.name as student_name,
             u.email as student_email
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      WHERE s.assignment_id = ?
      ORDER BY s.submitted_at DESC
    `;
    db.query(query, [assignmentId], callback);
  }
};

module.exports = CourseAssignment;
