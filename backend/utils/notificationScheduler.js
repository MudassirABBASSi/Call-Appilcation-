const cron = require('node-cron');
const db = require('../config/db');
const Notification = require('../models/Notification');
const notificationController = require('../controllers/notificationController');

class NotificationScheduler {
  constructor() {
    this.scheduler = null;
  }

  start() {
    console.log('✓ Notification scheduler started');
    
    // Run every 5 minutes
    this.scheduler = cron.schedule('*/5 * * * *', () => {
      this.checkUpcomingClasses();
    });

    // Run immediately on startup
    this.checkUpcomingClasses();
  }

  stop() {
    if (this.scheduler) {
      this.scheduler.stop();
      console.log('Notification scheduler stopped');
    }
  }

  checkUpcomingClasses() {
    // Get classes starting in 30 minutes or 15 minutes
    const query = `
      SELECT c.id, c.title, c.start_time, u.email as teacher_email,
             TIMESTAMPDIFF(MINUTE, NOW(), c.start_time) as minutes_until_start
      FROM classes c
      JOIN users u ON c.teacher_id = u.id
      WHERE c.is_active = TRUE
      AND c.start_time > NOW()
      AND TIMESTAMPDIFF(MINUTE, NOW(), c.start_time) > 0
    `;

    db.query(query, (err, classes) => {
      if (err) {
        console.error('Error fetching upcoming classes:', err);
        return;
      }

      classes.forEach(classData => {
        const minutesUntilStart = classData.minutes_until_start;

        // Notify 30 minutes before
        if (minutesUntilStart > 29 && minutesUntilStart <= 30) {
          this.notifyEnrolledStudents(classData, 30);
        }

        // Notify 15 minutes before
        if (minutesUntilStart > 14 && minutesUntilStart <= 15) {
          this.notifyEnrolledStudents(classData, 15);
        }
      });
    });
  }

  notifyEnrolledStudents(classData, minutesBefore) {
    // Get enrolled students
    const enrollmentQuery = `
      SELECT DISTINCT e.student_id, u.email, u.name
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.class_id = ?
    `;

    db.query(enrollmentQuery, [classData.id], (err, students) => {
      if (err) {
        console.error('Error fetching enrolled students:', err);
        return;
      }

      students.forEach(student => {
        const message = `Your class "${classData.title}" starts in ${minutesBefore} minutes!`;
        
        // Create in-app notification
        const notification = {
          user_id: student.student_id,
          class_id: classData.id,
          message: message,
          notification_type: 'class_reminder',
          scheduled_at: new Date()
        };

        Notification.create(notification, (err) => {
          if (err) {
            console.error('Error creating notification:', err);
          } else {
            // Send email notification
            const emailSubject = `Class Reminder: ${classData.title}`;
            const emailMessage = `
              <p>Hi ${student.name},</p>
              <p>Your class <strong>${classData.title}</strong> is starting in <strong>${minutesBefore} minutes</strong>!</p>
              <p>Make sure you are ready and have all your materials prepared.</p>
              <p><a href="http://localhost:3000/dashboard" style="background-color: #D4AF37; color: #0F3D3E; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Class</a></p>
            `;
            
            notificationController.sendEmailNotification(student.email, emailSubject, emailMessage);
          }
        });
      });
    });
  }
}

const scheduler = new NotificationScheduler();

module.exports = scheduler;
