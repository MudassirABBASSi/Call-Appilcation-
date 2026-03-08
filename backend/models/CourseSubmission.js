const db = require('../config/db');

const CourseSubmission = {
  create: (submissionData, callback) => {
    const query = `
      INSERT INTO submissions (assignment_id, student_id, file_url, submitted_at) 
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        file_url = ?, 
        submitted_at = NOW(),
        graded = FALSE,
        marks_obtained = NULL,
        feedback = NULL
    `;
    db.query(query, [
      submissionData.assignment_id,
      submissionData.student_id,
      submissionData.file_url,
      submissionData.file_url
    ], callback);
  },

  getAll: (callback) => {
    const query = `
      SELECT s.*, 
             a.title as assignment_title,
             a.total_marks,
             c.name as course_name,
             u.name as student_name,
             u.email as student_email,
             t.name as teacher_name
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      JOIN users u ON s.student_id = u.id
      JOIN users t ON a.teacher_id = t.id
      ORDER BY s.submitted_at DESC
    `;
    db.query(query, callback);
  },

  getById: (id, callback) => {
    const query = `
      SELECT s.*, 
             a.title as assignment_title,
             a.total_marks,
             a.teacher_id,
             a.course_id,
             u.name as student_name,
             u.email as student_email
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN users u ON s.student_id = u.id
      WHERE s.id = ?
    `;
    db.query(query, [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results && results.length > 0 ? results[0] : null);
    });
  },

  getByAssignmentId: (assignmentId, callback) => {
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
  },

  getByStudentId: (studentId, callback) => {
    const query = `
      SELECT s.*, 
             a.title as assignment_title,
             a.due_date,
             a.total_marks,
             c.name as course_name
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE s.student_id = ?
      ORDER BY s.submitted_at DESC
    `;
    db.query(query, [studentId], callback);
  },

  getByStudentAndAssignment: (assignmentId, studentId, callback) => {
    const query = `
      SELECT s.*, 
             a.title as assignment_title,
             a.total_marks,
             u.name as student_name
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN users u ON s.student_id = u.id
      WHERE s.assignment_id = ? AND s.student_id = ?
    `;
    db.query(query, [assignmentId, studentId], callback);
  },

  grade: (submissionId, marksObtained, feedback, callback) => {
    const query = `
      UPDATE submissions 
      SET marks_obtained = ?, feedback = ?, graded = TRUE
      WHERE id = ?
    `;
    db.query(query, [marksObtained, feedback, submissionId], callback);
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM submissions WHERE id = ?';
    db.query(query, [id], callback);
  },

  checkSubmission: (assignmentId, studentId, callback) => {
    const query = 'SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?';
    db.query(query, [assignmentId, studentId], callback);
  },

  findByAssignmentAndStudent: (assignmentId, studentId, callback) => {
    const query = `
      SELECT s.*, 
             a.title as assignment_title,
             a.total_marks,
             a.due_date,
             c.name as course_name
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE s.assignment_id = ? AND s.student_id = ?
    `;
    db.query(query, [assignmentId, studentId], callback);
  }
};

module.exports = CourseSubmission;
