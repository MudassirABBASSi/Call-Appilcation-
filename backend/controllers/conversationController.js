const db = require('../config/db');
const Conversation = require('../models/Conversation');

const conversationController = {
  // GET /api/conversations - Admin view all conversations with pagination
  getAllConversations: async (req, res) => {
    try {
      const user = req.user;

      // Only admin can view all conversations
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can view all conversations' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const conversations = await Conversation.getAllWithLastMessage(limit, offset);
      const totalCount = await Conversation.getTotalCount();

      return res.status(200).json({
        conversations,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
    }
  },

  // GET /api/conversations/:conversationId - Get single conversation with all messages
  getConversationMessages: async (req, res) => {
    try {
      const user = req.user;
      const conversationId = parseInt(req.params.conversationId);

      if (!conversationId || isNaN(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID' });
      }

      // Only admin can view any conversation, teacher/student can view their own
      const conversation = await Conversation.getById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      // Authorization check
      if (user.role !== 'admin') {
        if (user.role === 'teacher' && conversation.teacher_id !== user.id) {
          return res.status(403).json({ message: 'You can only view your own conversations' });
        }
        if (user.role === 'student' && conversation.student_id !== user.id) {
          return res.status(403).json({ message: 'You can only view your own conversations' });
        }
      }

      // Fetch all messages in this conversation
      const [messages] = await db.promise().query(
        `SELECT 
          m.id,
          m.conversation_id,
          m.sender_id,
          m.receiver_id,
          m.message,
          m.sent_at,
          m.is_read,
          u.name as sender_name,
          u.role as sender_role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.sent_at ASC`,
        [conversationId]
      );

      return res.status(200).json({
        conversation,
        messages,
        totalMessages: messages.length
      });
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      return res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
    }
  },

  // GET /api/conversations/teacher/:teacherId - Get conversations for a specific teacher
  getTeacherConversations: async (req, res) => {
    try {
      const user = req.user;
      const teacherId = parseInt(req.params.teacherId);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      if (!teacherId || isNaN(teacherId)) {
        return res.status(400).json({ message: 'Invalid teacher ID' });
      }

      // Only admin or the teacher themselves can view these conversations
      if (user.role !== 'admin' && (user.role !== 'teacher' || user.id !== teacherId)) {
        return res.status(403).json({ message: 'Not authorized to view these conversations' });
      }

      const conversations = await Conversation.getByTeacherId(teacherId, limit, offset);

      // Get total count for pagination
      const [countResult] = await db.promise().query(
        'SELECT COUNT(*) as total FROM conversations WHERE teacher_id = ?',
        [teacherId]
      );

      return res.status(200).json({
        conversations,
        pagination: {
          total: countResult[0].total,
          page,
          limit,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching teacher conversations:', error);
      return res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
    }
  },

  // GET /api/conversations/student/:studentId - Get conversations for a specific student
  getStudentConversations: async (req, res) => {
    try {
      const user = req.user;
      const studentId = parseInt(req.params.studentId);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      if (!studentId || isNaN(studentId)) {
        return res.status(400).json({ message: 'Invalid student ID' });
      }

      // Only admin or the student themselves can view these conversations
      if (user.role !== 'admin' && (user.role !== 'student' || user.id !== studentId)) {
        return res.status(403).json({ message: 'Not authorized to view these conversations' });
      }

      const conversations = await Conversation.getByStudentId(studentId, limit, offset);

      // Get total count for pagination
      const [countResult] = await db.promise().query(
        'SELECT COUNT(*) as total FROM conversations WHERE student_id = ?',
        [studentId]
      );

      return res.status(200).json({
        conversations,
        pagination: {
          total: countResult[0].total,
          page,
          limit,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching student conversations:', error);
      return res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
    }
  },

  // GET /api/conversations/:conversationId/messages - Paginated messages for a conversation
  getConversationMessagesPaginated: async (req, res) => {
    try {
      const user = req.user;
      const conversationId = parseInt(req.params.conversationId);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      if (!conversationId || isNaN(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID' });
      }

      // Get conversation details for authorization check
      const conversation = await Conversation.getById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      // Authorization check - only admin can view all, teacher/student can view their own
      if (user.role !== 'admin') {
        if (user.role === 'teacher' && conversation.teacher_id !== user.id) {
          return res.status(403).json({ message: 'You can only view your own conversations' });
        }
        if (user.role === 'student' && conversation.student_id !== user.id) {
          return res.status(403).json({ message: 'You can only view your own conversations' });
        }
      }

      // Fetch paginated messages
      const [messages] = await db.promise().query(
        `SELECT 
          m.id,
          m.conversation_id,
          m.sender_id,
          m.receiver_id,
          m.message,
          m.sent_at,
          m.is_read,
          u.name as sender_name,
          u.email as sender_email,
          u.role as sender_role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.sent_at ASC
        LIMIT ? OFFSET ?`,
        [conversationId, limit, offset]
      );

      // Get total message count
      const [countResult] = await db.promise().query(
        'SELECT COUNT(*) as total FROM messages WHERE conversation_id = ?',
        [conversationId]
      );

      return res.status(200).json({
        conversation,
        messages,
        pagination: {
          total: countResult[0].total,
          page,
          limit,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching paginated messages:', error);
      return res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
    }
  }
};

module.exports = conversationController;
