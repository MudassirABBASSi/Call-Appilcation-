const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All notification routes require authentication
router.use(authMiddleware);

// GET routes
router.get('/', notificationController.getUserNotifications);
router.get('/unread', notificationController.getUnreadNotifications);
router.get('/count', notificationController.getUnreadCount);

// PATCH/PUT routes (STEP 7: Support both PUT and PATCH)
router.patch('/:notificationId/read', notificationController.markAsRead);
router.put('/:notificationId/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.put('/read-all', notificationController.markAllAsRead);

// DELETE routes
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
