const cron = require('node-cron');
const db = require('../config/db');
const Notification = require('../models/Notification');

class NotificationScheduler {
  constructor() {
    this.task = null;
    this.activeSchedules = new Map();
  }

  /**
   * Start the notification scheduler
   * Runs every 5 minutes to check for upcoming classes
   */
  start() {
    if (this.task) {
      console.log('Notification scheduler already running');
      return;
    }

    // Run every 5 minutes
    this.task = cron.schedule('*/5 * * * *', () => {
      console.log(`[${new Date().toISOString()}] Notification Scheduler: Checking for upcoming classes...`);
      this.checkAndNotify();
    });

    console.log('✅ Notification Scheduler started (runs every 5 minutes)');
  }

  /**
   * Stop the notification scheduler
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('Notification Scheduler stopped');
    }
  }

  /**
   * Check for upcoming classes and send notifications
   */
  checkAndNotify() {
    // Get all upcoming classes with enrolled students
    const query = `
      SELECT c.id, c.title, c.start_time, c.teacher_id, 
             GROUP_CONCAT(e.student_id) as student_ids
      FROM classes c
      LEFT JOIN enrollments e ON c.id = e.class_id
      WHERE c.is_active = TRUE 
        AND c.start_time IS NOT NULL
        AND c.start_time > NOW()
        AND c.start_time <= DATE_ADD(NOW(), INTERVAL 35 MINUTE)
      GROUP BY c.id
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error checking for upcoming classes:', err);
        return;
      }

      if (results && results.length > 0) {
        results.forEach(classData => {
          this.scheduleNotifications(classData);
        });
      }
    });
  }

  /**
   * Schedule notifications for a specific class
   */
  scheduleNotifications(classData) {
    const classId = classData.id;
    const className = classData.title;
    const startTime = new Date(classData.start_time);
    const studentIds = classData.student_ids 
      ? classData.student_ids.split(',').map(id => parseInt(id)).filter(id => id)
      : [];

    if (studentIds.length === 0) return;

    // Check for 30 mins before
    this.checkAndCreateNotification(
      classId,
      studentIds,
      startTime,
      30,
      `Class "${className}" starts in 30 minutes`
    );

    // Check for 15 mins before
    this.checkAndCreateNotification(
      classId,
      studentIds,
      startTime,
      15,
      `Class "${className}" starts in 15 minutes`
    );
  }

  /**
   * Check if notification has been sent and create if needed
   */
  checkAndCreateNotification(classId, studentIds, startTime, minutesBefore, message) {
    const notifyTime = new Date(startTime.getTime() - minutesBefore * 60000);
    const now = new Date();

    // Only create if we're within 1 minute of the notify time
    if (now >= notifyTime && now < new Date(notifyTime.getTime() + 60000)) {
      // Check if already sent
      const checkQuery = `
        SELECT COUNT(*) as count 
        FROM notification_schedules 
        WHERE class_id = ? AND minutes_before = ? AND is_sent = TRUE
      `;

      db.query(checkQuery, [classId, minutesBefore], (err, results) => {
        if (err) {
          console.error('Error checking notification status:', err);
          return;
        }

        if (results[0].count === 0) {
          // Create bulk notifications
          Notification.createBulk(
            studentIds,
            message,
            'class_reminder',
            classId,
            (err) => {
              if (err) {
                console.error(`Error creating ${minutesBefore}min notifications:`, err);
                return;
              }

              // Mark as sent in schedule
              const updateQuery = `
                UPDATE notification_schedules 
                SET is_sent = TRUE 
                WHERE class_id = ? AND minutes_before = ?
              `;
              db.query(updateQuery, [classId, minutesBefore], (err) => {
                if (err) {
                  console.error('Error updating notification schedule:', err);
                  return;
                }
                console.log(`✅ Sent ${minutesBefore}min notifications for class ${classId}`);
              });
            }
          );
        }
      });
    }
  }

  /**
   * Manually trigger notification for a class
   */
  notifyClass(classId, message, callback) {
    const query = `
      SELECT GROUP_CONCAT(e.student_id) as student_ids
      FROM enrollments e
      WHERE e.class_id = ?
    `;

    db.query(query, [classId], (err, results) => {
      if (err) {
        return callback(err);
      }

      const studentIds = results[0].student_ids 
        ? results[0].student_ids.split(',').map(id => parseInt(id))
        : [];

      if (studentIds.length === 0) {
        return callback(null, { success: true, notified: 0 });
      }

      Notification.createBulk(
        studentIds,
        message,
        'manual_notification',
        classId,
        callback
      );
    });
  }
}

module.exports = new NotificationScheduler();
