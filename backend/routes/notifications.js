const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authMiddleware');

// Middleware
router.use(authMiddleware);

// ===================== USER NOTIFICATIONS =====================
router.get('/', notificationController.getUserNotifications);
router.get('/unread/count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

// ===================== ADMIN ROUTES =====================
router.post('/admin/notify-class/:classId', checkRole('admin'), notificationController.notifyClass);

module.exports = router;
