const db = require('../config/db');

const User = {
  create: (userData, callback) => {
    const query = 'INSERT INTO users (name, email, password, phone, course_name, teacher_id, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [
      userData.name,
      userData.email,
      userData.password,
      userData.phone || null,
      userData.course_name || null,
      userData.teacher_id || null,
      userData.role
    ], callback);
  },

  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], callback);
  },

  findById: (id, callback) => {
    const query = 'SELECT id, name, email, phone, course_name, teacher_id, role, created_at FROM users WHERE id = ?';
    db.query(query, [id], callback);
  },

  getAllByRole: (role, callback) => {
    const query = 'SELECT id, name, email, phone, course_name, teacher_id, role, created_at FROM users WHERE role = ?';
    db.query(query, [role], callback);
  },

  getStudentsByTeacherId: (teacherId, callback) => {
    const query = 'SELECT id, name, email, phone, course_name, teacher_id, role, created_at FROM users WHERE role = ? AND teacher_id = ? ORDER BY name ASC';
    db.query(query, ['student', teacherId], callback);
  },

  deleteById: (id, callback) => {
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], callback);
  },

  updateById: (id, userData, callback) => {
    const query = 'UPDATE users SET ? WHERE id = ?';
    db.query(query, [userData, id], callback);
  }
};

module.exports = User;
