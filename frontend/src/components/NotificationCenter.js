import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../api/api';
import { colors } from '../styles/colors';
import '../styles/notification-center.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getNotifications();
      const notifs = response.data.notifications || [];
      setNotifications(notifs);
      
      const unread = notifs.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'class_reminder':
        return '🔔';
      case 'enrollment_confirmation':
        return '•';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'class_reminder':
        return colors.gold;
      case 'enrollment_confirmation':
        return colors.emerald;
      default:
        return '#0078d4';
    }
  };

  return (
    <div className="notification-center">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`notification-center__bell ${unreadCount > 0 ? 'notification-center__bell--unread' : ''}`}
        title={`${unreadCount} unread notifications`}
      >
        🔔
        {unreadCount > 0 && <span className="notification-center__badge">{unreadCount}</span>}
      </button>

      {showPanel && (
        <div className="notification-center__panel">
          <div className="notification-center__header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="notification-center__mark-all"
              >
                Mark All as Read
              </button>
            )}
          </div>

          {loading ? (
            <div className="notification-center__loading">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="notification-center__empty">No notifications</div>
          ) : (
            <div className="notification-center__list">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-center__item ${notification.is_read ? '' : 'notification-center__item--unread'}`}
                  style={{ '--notification-accent': getNotificationColor(notification.notification_type) }}
                >
                  <div className="notification-center__content">
                    <span className="notification-center__icon">{getNotificationIcon(notification.notification_type)}</span>
                    <div className="notification-center__message-wrap">
                      <p className="notification-center__message">{notification.message}</p>
                      <span className="notification-center__timestamp">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="notification-center__actions">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="notification-center__action-btn"
                        title="Mark as read"
                      >
                        •
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="notification-center__action-btn"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
