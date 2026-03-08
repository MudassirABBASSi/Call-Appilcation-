const db = require('../config/db');

const Notification = {
  // Create a notification
  create: (notificationData, callback) => {
    const query = `
      INSERT INTO notifications (user_id, class_id, assignment_id, submission_id, message, notification_type, scheduled_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [
      notificationData.user_id,
      notificationData.class_id || null,
      notificationData.assignment_id || null,
      notificationData.submission_id || null,
      notificationData.message,
      notificationData.notification_type || 'general',
      notificationData.scheduled_at || null
    ], callback);
  },

  // Create bulk notifications for multiple users
  createBulk: (notifications, callback) => {
    if (!notifications || notifications.length === 0) {
      return callback(null, { affectedRows: 0 });
    }

    const values = notifications.map(n => [
      n.user_id,
      n.class_id || null,
      n.assignment_id || null,
      n.submission_id || null,
      n.message,
      n.notification_type || 'general',
      n.scheduled_at || null
    ]);

    const query = `
      INSERT INTO notifications (user_id, class_id, assignment_id, submission_id, message, notification_type, scheduled_at)
      VALUES ?
    `;
    db.query(query, [values], callback);
  },

  // Get user's notifications
  getUserNotifications: (userId, callback) => {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `;
    db.query(query, [userId], callback);
  },

  // Get unread notifications
  getUnreadNotifications: (userId, callback) => {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = ? AND is_read = FALSE
      ORDER BY created_at DESC
    `;
    db.query(query, [userId], callback);
  },

  // Mark notification as read
  markAsRead: (notificationId, callback) => {
    const query = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE id = ?
    `;
    db.query(query, [notificationId], callback);
  },

  // Mark all notifications as read
  markAllAsRead: (userId, callback) => {
    const query = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE user_id = ?
    `;
    db.query(query, [userId], callback);
  },

  // Get pending scheduled notifications
  getPendingNotifications: (callback) => {
    const query = `
      SELECT * FROM notifications
      WHERE scheduled_at IS NOT NULL 
      AND sent_at IS NULL
      AND scheduled_at <= NOW()
      ORDER BY scheduled_at ASC
    `;
    db.query(query, callback);
  },

  // Mark notification as sent
  markAsSent: (notificationId, callback) => {
    const query = `
      UPDATE notifications 
      SET sent_at = NOW() 
      WHERE id = ?
    `;
    db.query(query, [notificationId], callback);
  },

  // Delete a notification
  delete: (notificationId, callback) => {
    const query = `
      DELETE FROM notifications 
      WHERE id = ?
    `;
    db.query(query, [notificationId], callback);
  },

  // Get unread count for user
  getUnreadCount: (userId, callback) => {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ? AND is_read = FALSE
    `;
    db.query(query, [userId], callback);
  }
};

module.exports = Notification;
