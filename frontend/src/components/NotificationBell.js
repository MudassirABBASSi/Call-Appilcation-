import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { notificationsAPI } from '../api/api';
import NotificationDropdown from './NotificationDropdown';
import '../styles/notifications.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch notifications on component mount
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getUnreadNotifications();
      const unreadNotifications = response.data.notifications || [];
      
      // Check if there are new notifications
      if (unreadNotifications.length > unreadCount && unreadCount > 0) {
        // Show toast for new notifications
        const latestNotification = unreadNotifications[0];
        toast.info(latestNotification?.message || 'You have a new notification', {
          autoClose: 5000,
          position: 'top-right'
        });
      }
      
      setNotifications(unreadNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      // Backend can be temporarily unavailable during restarts; keep polling silently.
      if (error?.code !== 'ERR_NETWORK' && error?.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n.id !== notificationId)
      );
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      
      // Clear all notifications
      setNotifications([]);
      setUnreadCount(0);
      
      toast.success('All notifications marked as read');
      closeDropdown();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark all as read');
    }
  };

  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell-button" 
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClose={closeDropdown}
          loading={loading}
        />
      )}
    </div>
  );
};

export default NotificationBell;
