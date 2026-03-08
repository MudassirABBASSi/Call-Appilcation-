const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

exports.getUserNotifications = (req, res) => {
  const userId = req.user.id;

  Notification.getUserNotifications(userId, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
    }
    res.status(200).json({ notifications: results || [] });
  });
};

exports.getUnreadNotifications = (req, res) => {
  const userId = req.user.id;

  Notification.getUnreadNotifications(userId, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch unread notifications', error: err.message });
    }
    res.status(200).json({ notifications: results || [] });
  });
};

exports.markAsRead = (req, res) => {
  const { notificationId } = req.params;
  const parsedNotificationId = Number(notificationId);

  if (!parsedNotificationId || Number.isNaN(parsedNotificationId)) {
    return res.status(400).json({ message: 'Invalid notification id' });
  }

  Notification.markAsRead(parsedNotificationId, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to mark notification as read', error: err.message });
    }
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification marked as read' });
  });
};

exports.markAllAsRead = (req, res) => {
  const userId = req.user.id;

  Notification.markAllAsRead(userId, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to mark notifications as read', error: err.message });
    }
    res.status(200).json({
      message: 'All notifications marked as read',
      updatedCount: result?.affectedRows || 0
    });
  });
};

exports.deleteNotification = (req, res) => {
  const { notificationId } = req.params;
  const parsedNotificationId = Number(notificationId);

  if (!parsedNotificationId || Number.isNaN(parsedNotificationId)) {
    return res.status(400).json({ message: 'Invalid notification id' });
  }

  Notification.delete(parsedNotificationId, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to delete notification', error: err.message });
    }
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted' });
  });
};

exports.getUnreadCount = (req, res) => {
  const userId = req.user.id;

  Notification.getUnreadCount(userId, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch unread count', error: err.message });
    }
    
    const count = result?.[0]?.count || 0;
    res.status(200).json({ count: count });
  });
};

// Send email notification
exports.sendEmailNotification = async (emailAddress, subject, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'classroom@example.com',
      to: emailAddress,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background-color: #0F3D3E; color: #F5F7F6; padding: 20px; text-align: center;">
            <h2>Alburhan Classroom Notification</h2>
          </div>
          <div style="padding: 20px; background-color: #F5F7F6;">
            <p>${message}</p>
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              © 2026 Alburhan Classroom. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${emailAddress}`);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};
