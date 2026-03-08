const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// All messaging routes require authentication
router.use(authMiddleware);
router.use(checkRole('student', 'teacher'));

// POST /api/messages/send
router.post('/send', messagesController.sendMessage);

// GET /api/messages/conversation/:userId
router.get('/conversation/:userId', messagesController.getConversation);

// GET /api/messages/unread-count
router.get('/unread-count', messagesController.getUnreadCount);

// GET /api/messages/contacts
router.get('/contacts', messagesController.getContacts);

module.exports = router;
