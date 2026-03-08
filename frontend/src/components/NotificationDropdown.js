import React, { useEffect, useRef } from 'react';
import '../styles/notifications.css';

const NotificationDropdown = ({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onClose,
  loading 
}) => {
  const dropdownRef = useRef(null);
  const latestNotifications = notifications.slice(0, 5);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      const options = { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return notificationDate.toLocaleDateString('en-US', options);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment_created':
        return '�';
      case 'assignment_graded':
        return '✅';
      case 'assignment_submitted':
        return '�';
      case 'reminder':
        return '⏰';
      default:
        return '🔔';
    }
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-dropdown-header">
        <h3>Notifications</h3>
        {notifications.length > 0 && (
          <button 
            className="mark-all-read-btn" 
            onClick={onMarkAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="notification-list">
        {loading ? (
          <div className="notification-loading">
            Loading notifications...
          </div>
        ) : latestNotifications.length === 0 ? (
          <div className="notification-empty">
            <span className="empty-icon">✓</span>
            <p>No new notifications</p>
            <p className="empty-subtitle">You're all caught up!</p>
          </div>
        ) : (
          latestNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className="notification-item"
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.notification_type)}
              </div>
              <div className="notification-content">
                <p className="notification-message">
                  {notification.message}
                </p>
                <span className="notification-timestamp">
                  {formatTimestamp(notification.created_at)}
                </span>
              </div>
              <button
                className="mark-read-btn"
                onClick={() => onMarkAsRead(notification.id)}
                aria-label="Mark as read"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="notification-dropdown-footer">
          <p className="notification-count">
            Showing latest {latestNotifications.length} of {notifications.length} unread notification{notifications.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
