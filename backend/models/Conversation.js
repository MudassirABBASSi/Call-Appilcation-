const db = require('../config/db');

const Conversation = {
  // Get or create conversation between teacher and student
  findOrCreate: async (teacher_id, student_id) => {
    try {
      // First, check if conversation exists
      const [exists] = await db.promise().query(
        'SELECT id FROM conversations WHERE teacher_id = ? AND student_id = ?',
        [teacher_id, student_id]
      );

      if (exists.length > 0) {
        return exists[0].id;
      }

      // If not, create new conversation
      const [result] = await db.promise().query(
        'INSERT INTO conversations (teacher_id, student_id) VALUES (?, ?)',
        [teacher_id, student_id]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  },

  // Get conversation by ID with participant details
  getById: async (conversationId) => {
    try {
      const [rows] = await db.promise().query(
        `SELECT 
          c.id,
          c.teacher_id,
          c.student_id,
          c.created_at,
          t.name as teacher_name,
          t.email as teacher_email,
          s.name as student_name,
          s.email as student_email
        FROM conversations c
        JOIN users t ON c.teacher_id = t.id
        JOIN users s ON c.student_id = s.id
        WHERE c.id = ?
        LIMIT 1`,
        [conversationId]
      );

      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Get all conversations with last message info (for admin view)
  getAllWithLastMessage: async (limit = 20, offset = 0) => {
    try {
      const [rows] = await db.promise().query(
        `SELECT 
          c.id,
          c.teacher_id,
          c.student_id,
          c.created_at,
          t.name as teacher_name,
          t.email as teacher_email,
          s.name as student_name,
          s.email as student_email,
          (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message,
          (SELECT sent_at FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message_at,
          (SELECT sender_id FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message_sender_id,
          (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = 0) as unread_count
        FROM conversations c
        JOIN users t ON c.teacher_id = t.id
        JOIN users s ON c.student_id = s.id
        ORDER BY last_message_at DESC
        LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Get total conversation count
  getTotalCount: async () => {
    try {
      const [rows] = await db.promise().query(
        'SELECT COUNT(*) as total FROM conversations'
      );

      return rows[0]?.total || 0;
    } catch (error) {
      throw error;
    }
  },

  // Get conversations for a specific teacher
  getByTeacherId: async (teacher_id, limit = 20, offset = 0) => {
    try {
      const [rows] = await db.promise().query(
        `SELECT 
          c.id,
          c.teacher_id,
          c.student_id,
          c.created_at,
          s.name as student_name,
          s.email as student_email,
          (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message,
          (SELECT sent_at FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message_at,
          (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = 0 AND receiver_id = ?) as unread_count
        FROM conversations c
        JOIN users s ON c.student_id = s.id
        WHERE c.teacher_id = ?
        ORDER BY last_message_at DESC
        LIMIT ? OFFSET ?`,
        [teacher_id, teacher_id, limit, offset]
      );

      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Get conversations for a specific student
  getByStudentId: async (student_id, limit = 20, offset = 0) => {
    try {
      const [rows] = await db.promise().query(
        `SELECT 
          c.id,
          c.teacher_id,
          c.student_id,
          c.created_at,
          t.name as teacher_name,
          t.email as teacher_email,
          (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message,
          (SELECT sent_at FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message_at,
          (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = 0 AND receiver_id = ?) as unread_count
        FROM conversations c
        JOIN users t ON c.teacher_id = t.id
        WHERE c.student_id = ?
        ORDER BY last_message_at DESC
        LIMIT ? OFFSET ?`,
        [student_id, student_id, limit, offset]
      );

      return rows;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Conversation;
