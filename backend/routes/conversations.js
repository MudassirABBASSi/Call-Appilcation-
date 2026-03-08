const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All conversation routes require authentication
router.use(authMiddleware);

// GET /api/conversations/teacher/:teacherId - Get conversations for a teacher (specific routes first!)
router.get('/teacher/:teacherId', conversationController.getTeacherConversations);

// GET /api/conversations/student/:studentId - Get conversations for a student
router.get('/student/:studentId', conversationController.getStudentConversations);

// GET /api/conversations/:conversationId/messages - Get paginated messages for a conversation
router.get('/:conversationId/messages', conversationController.getConversationMessagesPaginated);

// GET /api/conversations/:conversationId - Get single conversation details and all messages
router.get('/:conversationId', conversationController.getConversationMessages);

// GET /api/conversations - Admin view all conversations (paginated)
router.get('/', conversationController.getAllConversations);

module.exports = router;
