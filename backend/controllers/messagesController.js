const db = require('../config/db');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');

const getUserById = async (id) => {
  const [rows] = await db.promise().query(
    'SELECT id, name, role, teacher_id FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

const isMessagingRole = (role) => role === 'student' || role === 'teacher';

const canUsersMessage = (sender, receiver) => {
  if (!sender || !receiver) {
    return false;
  }

  if (!isMessagingRole(sender.role) || !isMessagingRole(receiver.role)) {
    return false;
  }

  if (sender.role === 'student') {
    return receiver.role === 'teacher' && Number(sender.teacher_id) === Number(receiver.id);
  }

  if (sender.role === 'teacher') {
    return receiver.role === 'student' && Number(receiver.teacher_id) === Number(sender.id);
  }

  return false;
};

const messagesController = {
  // POST /api/messages/send
  sendMessage: async (req, res) => {
    try {
      const sender_id = req.user.id;
      const { receiver_id, message } = req.body;
      const parsedReceiverId = Number(receiver_id);
      const sanitizedMessage = String(message || '').trim();

      if (!parsedReceiverId || Number.isNaN(parsedReceiverId) || !sanitizedMessage) {
        return res.status(400).json({ message: 'receiver_id and message are required' });
      }

      if (Number(sender_id) === parsedReceiverId) {
        return res.status(400).json({ message: 'Users cannot message themselves' });
      }

      const sender = await getUserById(sender_id);
      if (!sender) {
        return res.status(404).json({ message: 'Sender not found' });
      }

      const receiver = await getUserById(parsedReceiverId);
      if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' });
      }

      if (!canUsersMessage(sender, receiver)) {
        if (sender.role === 'student') {
          return res.status(403).json({ message: 'Student can only message their assigned teacher' });
        }
        if (sender.role === 'teacher') {
          return res.status(403).json({ message: 'Teacher can only message students assigned to them' });
        }
        return res.status(403).json({ message: 'This user role is not allowed to send messages' });
      }

      // Determine relationship for conversation creation
      let teacher_id, student_id;
      if (sender.role === 'teacher') {
        teacher_id = sender_id;
        student_id = parsedReceiverId;
      } else {
        teacher_id = parsedReceiverId;
        student_id = sender_id;
      }

      // Get or create conversation
      const conversation_id = await Conversation.findOrCreate(teacher_id, student_id);

      // Insert message with conversation_id
      const [result] = await db.promise().query(
        'INSERT INTO messages (conversation_id, sender_id, receiver_id, message, sent_at) VALUES (?, ?, ?, ?, NOW())',
        [conversation_id, sender_id, parsedReceiverId, sanitizedMessage]
      );

      // Create notification for receiver
      await new Promise((resolve, reject) => {
        Notification.create(
          {
            user_id: parsedReceiverId,
            message: `New message from ${sender.name}`,
            notification_type: 'general'
          },
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });

      // Fetch the created message
      const [createdMessage] = await db.promise().query(
        'SELECT id, conversation_id, sender_id, receiver_id, message, sent_at, is_read FROM messages WHERE id = ?',
        [result.insertId]
      );

      return res.status(201).json({
        message: 'Message sent successfully',
        data: createdMessage[0]
      });
    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
  },

  // GET /api/messages/conversation/:userId
  getConversation: async (req, res) => {
    try {
      const loggedUserId = req.user.id;
      const otherUserId = parseInt(req.params.userId);

      if (!otherUserId || isNaN(otherUserId)) {
        return res.status(400).json({ message: 'Invalid userId parameter' });
      }

      if (Number(loggedUserId) === Number(otherUserId)) {
        return res.status(400).json({ message: 'Cannot fetch conversation with yourself' });
      }

      // Verify other user exists
      const loggedUser = await getUserById(loggedUserId);
      if (!loggedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!isMessagingRole(loggedUser.role)) {
        return res.status(403).json({ message: 'This user role is not allowed to view conversations' });
      }

      const otherUser = await getUserById(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!canUsersMessage(loggedUser, otherUser)) {
        return res.status(403).json({ message: 'You are not allowed to view this conversation' });
      }

      // Fetch conversation
      const messages = await Message.getConversation(loggedUserId, otherUserId);

      // Mark unread messages as read (where logged user is receiver)
      await Message.markAsRead(loggedUserId, otherUserId);

      return res.status(200).json({
        conversation: messages,
        participantId: otherUserId,
        participantName: otherUser.name
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return res.status(500).json({ message: 'Failed to fetch conversation', error: error.message });
    }
  },

  // GET /api/messages/unread-count
  getUnreadCount: async (req, res) => {
    try {
      const loggedUserId = req.user.id;
      const loggedUser = await getUserById(loggedUserId);

      if (!loggedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!isMessagingRole(loggedUser.role)) {
        return res.status(403).json({ message: 'This user role is not allowed to access unread counts' });
      }

      const unreadCount = await Message.getUnreadCount(loggedUserId);

      return res.status(200).json({
        unreadCount
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return res.status(500).json({ message: 'Failed to fetch unread count', error: error.message });
    }
  },

  // GET /api/messages/contacts
  getContacts: async (req, res) => {
    try {
      const loggedUserId = req.user.id;
      const loggedUser = await getUserById(loggedUserId);

      if (!loggedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      let contacts = [];

      if (loggedUser.role === 'student') {
        // Student can only message their assigned teacher
        if (loggedUser.teacher_id) {
          const teacher = await getUserById(loggedUser.teacher_id);
          if (teacher) {
            // Get unread count from this teacher
            const [unreadRows] = await db.promise().query(
              'SELECT COUNT(*) as count FROM messages WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
              [teacher.id, loggedUserId]
            );
            contacts.push({
              id: teacher.id,
              name: teacher.name,
              role: teacher.role,
              unreadCount: unreadRows[0].count
            });
          }
        }
      } else if (loggedUser.role === 'teacher') {
        // Teacher can message all assigned students with unread counts from one query.
        const [students] = await db.promise().query(
          `SELECT u.id, u.name, u.role, COALESCE(unread_counts.count, 0) AS unreadCount
           FROM users u
           LEFT JOIN (
             SELECT sender_id, COUNT(*) AS count
             FROM messages
             WHERE receiver_id = ? AND is_read = FALSE
             GROUP BY sender_id
           ) unread_counts ON unread_counts.sender_id = u.id
           WHERE u.teacher_id = ? AND u.role = 'student'
           ORDER BY u.name ASC`,
          [loggedUserId, loggedUserId]
        );

        contacts = students;
      } else if (loggedUser.role === 'admin') {
        return res.status(403).json({ message: 'Admin cannot send messages' });
      }

      return res.status(200).json({
        contacts
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return res.status(500).json({ message: 'Failed to fetch contacts', error: error.message });
    }
  }
};

module.exports = messagesController;
