const db = require('../config/db');

const Class = {
  create: (classData, callback) => {
    const query = 'INSERT INTO classes (title, description, date, roomId, teacher_id) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [classData.title, classData.description, classData.date, classData.roomId, classData.teacher_id], callback);
  },

  getAll: (callback) => {
    const query = `
      SELECT classes.*, 
             users.name as teacher_name,
             COUNT(DISTINCT cs.student_id) as student_count
      FROM classes 
      JOIN users ON classes.teacher_id = users.id
      LEFT JOIN class_students cs ON classes.id = cs.class_id
      GROUP BY classes.id
      ORDER BY classes.date DESC
    `;
    db.query(query, callback);
  },

  getByTeacherId: (teacherId, callback) => {
    const query = `
      SELECT classes.*, 
             users.name as teacher_name,
             COUNT(DISTINCT cs.student_id) as student_count
      FROM classes 
      JOIN users ON classes.teacher_id = users.id
      LEFT JOIN class_students cs ON classes.id = cs.class_id
      WHERE classes.teacher_id = ?
      GROUP BY classes.id
      ORDER BY classes.date DESC
    `;
    db.query(query, [teacherId], callback);
  },

  getUpcoming: (callback) => {
    const query = `
      SELECT classes.*, 
             users.name as teacher_name,
             COUNT(DISTINCT cs.student_id) as student_count
      FROM classes 
      JOIN users ON classes.teacher_id = users.id
      LEFT JOIN class_students cs ON classes.id = cs.class_id
      WHERE classes.date >= NOW()
      GROUP BY classes.id
      ORDER BY classes.date ASC
    `;
    db.query(query, callback);
  },

  findById: (id, callback) => {
    const query = `
      SELECT classes.*, users.name as teacher_name 
      FROM classes 
      JOIN users ON classes.teacher_id = users.id
      WHERE classes.id = ?
    `;
    db.query(query, [id], callback);
  },

  deleteById: (id, callback) => {
    const query = 'DELETE FROM classes WHERE id = ?';
    db.query(query, [id], callback);
  },

  // Enroll students in a class
  enrollStudents: (classId, studentIds, callback) => {
    if (!studentIds || studentIds.length === 0) {
      return callback(null, { affectedRows: 0 });
    }

    // Create values array for bulk insert: [(classId, studentId1), (classId, studentId2), ...]
    const values = studentIds.map(studentId => [classId, studentId]);
    const query = 'INSERT INTO class_students (class_id, student_id) VALUES ?';
    
    db.query(query, [values], callback);
  }
};

module.exports = Class;
