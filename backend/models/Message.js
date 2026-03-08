const db = require('../config/db');

class Message {
  static async create({ sender_id, receiver_id, message }) {
    const query = `
      INSERT INTO messages (sender_id, receiver_id, message)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.promise().query(query, [sender_id, receiver_id, message]);
    return result.insertId;
  }

  static async findById(id) {
    const query = `
      SELECT m.id, m.sender_id, m.receiver_id, m.message, m.sent_at, m.is_read,
             s.name as sender_name,
             r.name as receiver_name
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE m.id = ?
    `;
    const [rows] = await db.promise().query(query, [id]);
    return rows[0] || null;
  }

  static async getConversation(user1Id, user2Id) {
    const query = `
      SELECT m.id, m.sender_id, m.receiver_id, m.message, m.sent_at, m.is_read,
             s.name as sender_name,
             r.name as receiver_name
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.sent_at ASC
    `;
    const [rows] = await db.promise().query(query, [user1Id, user2Id, user2Id, user1Id]);
    return rows;
  }

  static async markAsRead(receiverId, senderId) {
    const query = `
      UPDATE messages
      SET is_read = TRUE
      WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE
    `;
    const [result] = await db.promise().query(query, [receiverId, senderId]);
    return result.affectedRows;
  }

  static async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM messages
      WHERE receiver_id = ? AND is_read = FALSE
    `;
    const [rows] = await db.promise().query(query, [userId]);
    return rows[0].count;
  }

  static async getAllMessages({ limit = 50, offset = 0 }) {
    const query = `
      SELECT m.id, m.sender_id, m.receiver_id, m.message, m.sent_at, m.is_read,
             s.name as sender_name, s.role as sender_role,
             r.name as receiver_name, r.role as receiver_role
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      ORDER BY m.sent_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.promise().query(query, [limit, offset]);
    return rows;
  }

  static async getTotalCount() {
    const query = `SELECT COUNT(*) as total FROM messages`;
    const [rows] = await db.promise().query(query);
    return rows[0].total;
  }
}

module.exports = Message;
