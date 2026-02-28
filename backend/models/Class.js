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
  },

  // Get students in a class (Promise version for assignments)
  getStudents: async (classId) => {
    try {
      const query = `
        SELECT users.id, users.name, users.email
        FROM users
        JOIN class_students cs ON users.id = cs.student_id
        WHERE cs.class_id = ? AND users.role = 'student'
        ORDER BY users.name ASC
      `;
      const [rows] = await db.promise().query(query, [classId]);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Find by ID (Promise version)
  findById: async (id) => {
    try {
      const query = `
        SELECT classes.*, users.name as teacher_name 
        FROM classes 
        JOIN users ON classes.teacher_id = users.id
        WHERE classes.id = ?
      `;
      const [rows] = await db.promise().query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Class;
