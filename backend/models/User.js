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
    db.query(query, [id], (err, results) => {
      if (err && err.code === 'ER_BAD_FIELD_ERROR') {
        const fallbackQuery = 'SELECT id, name, email, role, created_at, NULL AS phone, NULL AS course_name, NULL AS teacher_id FROM users WHERE id = ?';
        return db.query(fallbackQuery, [id], callback);
      }
      callback(err, results);
    });
  },

  getAllByRole: (role, callback) => {
    if (role === 'student') {
      const query = `
        SELECT s.id, s.name, s.email, s.phone, s.course_name, s.teacher_id, s.role, s.created_at,
               t.name as teacher_name
        FROM users s
        LEFT JOIN users t ON s.teacher_id = t.id AND t.role = 'teacher'
        WHERE s.role = ?
        ORDER BY s.name ASC
      `;
      db.query(query, [role], (err, results) => {
        if (err && err.code === 'ER_BAD_FIELD_ERROR') {
          const fallbackQuery = `
            SELECT id, name, email, role, created_at,
                   NULL AS phone, NULL AS course_name, NULL AS teacher_id, NULL AS teacher_name
            FROM users
            WHERE role = ?
            ORDER BY name ASC
          `;
          return db.query(fallbackQuery, [role], callback);
        }
        callback(err, results);
      });
    } else {
      const query = 'SELECT id, name, email, phone, course_name, teacher_id, role, created_at FROM users WHERE role = ? ORDER BY name ASC';
      db.query(query, [role], (err, results) => {
        if (err && err.code === 'ER_BAD_FIELD_ERROR') {
          const fallbackQuery = 'SELECT id, name, email, role, created_at, NULL AS phone, NULL AS course_name, NULL AS teacher_id FROM users WHERE role = ? ORDER BY name ASC';
          return db.query(fallbackQuery, [role], callback);
        }
        callback(err, results);
      });
    }
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
  },

  // Password Reset Methods
  setResetToken: (email, hashedToken, expiryDate, callback) => {
    const query = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
    db.query(query, [hashedToken, expiryDate, email], callback);
  },

  findByResetToken: (hashedToken, callback) => {
    const query = 'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()';
    db.query(query, [hashedToken], callback);
  },

  clearResetToken: (userId, callback) => {
    const query = 'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?';
    db.query(query, [userId], callback);
  },

  updatePassword: (userId, hashedPassword, callback) => {
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(query, [hashedPassword, userId], callback);
  },

  // OTP Verification Tracking
  updateOtpVerifiedAt: (userId, callback) => {
    const query = 'UPDATE users SET otp_verified_at = NOW() WHERE id = ?';
    db.query(query, [userId], callback);
  }
};

module.exports = User;
