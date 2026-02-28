const Notification = require('../models/Notification');
const notificationScheduler = require('../utils/notificationScheduler');

const notificationController = {
  /**
   * Get user notifications
   * GET /api/notifications
   */
  getUserNotifications: (req, res) => {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    Notification.getUserNotifications(userId, (err, notifications) => {
      if (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching notifications',
          error: err.message
        });
      }

      res.json({
        success: true,
        data: notifications || []
      });
    });
  },

  /**
   * Get unread notification count
   * GET /api/notifications/unread
   */
  getUnreadCount: (req, res) => {
    const userId = req.user.id;

    Notification.getUnreadCount(userId, (err, results) => {
      if (err) {
        console.error('Error fetching unread count:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching unread count',
          error: err.message
        });
      }

      res.json({
        success: true,
        unread_count: results[0].unread_count
      });
    });
  },

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  markAsRead: (req, res) => {
    const notificationId = req.params.id;

    Notification.markAsRead(notificationId, (err, result) => {
      if (err) {
        console.error('Error marking notification as read:', err);
        return res.status(500).json({
          success: false,
          message: 'Error marking notification as read',
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    });
  },

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   */
  markAllAsRead: (req, res) => {
    const userId = req.user.id;

    Notification.markAllAsRead(userId, (err, result) => {
      if (err) {
        console.error('Error marking all notifications as read:', err);
        return res.status(500).json({
          success: false,
          message: 'Error marking notifications as read',
          error: err.message
        });
      }

      res.json({
        success: true,
        message: 'All notifications marked as read',
        affected: result.affectedRows
      });
    });
  },

  /**
   * Delete notification
   * DELETE /api/notifications/:id
   */
  deleteNotification: (req, res) => {
    const notificationId = req.params.id;

    Notification.delete(notificationId, (err, result) => {
      if (err) {
        console.error('Error deleting notification:', err);
        return res.status(500).json({
          success: false,
          message: 'Error deleting notification',
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted'
      });
    });
  },

  /**
   * Admin: Notify class
   * POST /api/admin/notify-class/:classId
   */
  notifyClass: (req, res) => {
    const { classId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    notificationScheduler.notifyClass(classId, message, (err, result) => {
      if (err) {
        console.error('Error notifying class:', err);
        return res.status(500).json({
          success: false,
          message: 'Error notifying class',
          error: err.message
        });
      }

      res.json({
        success: true,
        message: 'Notifications sent successfully',
        notified: result.affectedRows || 0
      });
    });
  }
};

module.exports = notificationController;
