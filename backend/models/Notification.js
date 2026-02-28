const db = require('../config/db');

const Notification = {
  // Create notification
  create: (userId, message, type = 'class_reminder', classId = null, callback) => {
    const query = `
      INSERT INTO notifications (user_id, message, type, related_class_id)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [userId, message, type, classId], callback);
  },

  // Get notifications for a user
  getUserNotifications: (userId, callback) => {
    const query = `
      SELECT n.*, c.title as class_title
      FROM notifications n
      LEFT JOIN classes c ON n.related_class_id = c.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `;
    db.query(query, [userId], callback);
  },

  // Get unread notifications count
  getUnreadCount: (userId, callback) => {
    const query = 'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE';
    db.query(query, [userId], callback);
  },

  // Mark notification as read
  markAsRead: (notificationId, callback) => {
    const query = 'UPDATE notifications SET is_read = TRUE WHERE id = ?';
    db.query(query, [notificationId], callback);
  },

  // Mark all notifications as read for user
  markAllAsRead: (userId, callback) => {
    const query = 'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE';
    db.query(query, [userId], callback);
  },

  // Delete notification
  delete: (notificationId, callback) => {
    const query = 'DELETE FROM notifications WHERE id = ?';
    db.query(query, [notificationId], callback);
  },

  // Create bulk notifications (for class reminders)
  createBulk: (userIds, message, type, classId, callback) => {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return callback(null, { affectedRows: 0 });
    }

    const query = `
      INSERT INTO notifications (user_id, message, type, related_class_id)
      VALUES ${userIds.map(() => '(?, ?, ?, ?)').join(',')}
    `;
    
    const values = [];
    userIds.forEach(userId => {
      values.push(userId, message, type, classId);
    });

    db.query(query, values, callback);
  }
};

module.exports = Notification;
