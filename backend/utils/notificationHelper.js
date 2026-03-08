const Notification = require('../models/Notification');
const db = require('../config/db');

/**
 * Comprehensive Notification Helper Utility
 * Provides clean, reusable functions for creating notifications across the system
 * All functions use async/await for better error handling
 */

const notificationHelper = {
  /**
   * Create a single notification
   * @param {Object} data - Notification data
   * @param {number} data.user_id - User ID to receive notification
   * @param {string} data.message - Notification message
   * @param {string} data.notification_type - Type of notification
   * @param {number} [data.class_id] - Optional class ID (reference_id for class reminders)
   * @param {number} [data.assignment_id] - Optional assignment ID
   * @param {number} [data.submission_id] - Optional submission ID
   * @param {Date} [data.scheduled_at] - Optional scheduled time
   * @returns {Promise<Object>} Created notification result
   */
  async createNotification(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const notificationData = {
          user_id: data.user_id,
          message: data.message,
          notification_type: data.notification_type || 'general',
          class_id: data.class_id || null,
          assignment_id: data.assignment_id || null,
          submission_id: data.submission_id || null,
          scheduled_at: data.scheduled_at || null
        };

        // DUPLICATE PREVENTION for class_reminder notifications
        if (data.notification_type === 'class_reminder' && data.class_id) {
          const promiseDb = db.promise();
          const [existing] = await promiseDb.query(
            `SELECT id FROM notifications 
             WHERE user_id = ? 
             AND notification_type = 'class_reminder' 
             AND class_id = ? 
             AND is_read = FALSE
             LIMIT 1`,
            [data.user_id, data.class_id]
          );

          if (existing && existing.length > 0) {
            console.log(`Duplicate class_reminder notification prevented for user ${data.user_id}, class ${data.class_id}`);
            return resolve({ insertId: existing[0].id, duplicate_prevented: true });
          }
        }

        // DUPLICATE PREVENTION for assignment_graded notifications (STEP 5)
        if (data.notification_type === 'assignment_graded' && data.submission_id) {
          const promiseDb = db.promise();
          const [existing] = await promiseDb.query(
            `SELECT id FROM notifications 
             WHERE user_id = ? 
             AND notification_type = 'assignment_graded' 
             AND submission_id = ? 
             LIMIT 1`,
            [data.user_id, data.submission_id]
          );

          if (existing && existing.length > 0) {
            console.log(`Duplicate assignment_graded notification prevented for user ${data.user_id}, submission ${data.submission_id}`);
            return resolve({ insertId: existing[0].id, duplicate_prevented: true });
          }
        }

        // Create the notification
        Notification.create(notificationData, (err, result) => {
          if (err) {
            console.error('Error creating notification:', err);
            return reject(err);
          }
          resolve(result);
        });
      } catch (error) {
        console.error('Error in createNotification:', error);
        reject(error);
      }
    });
  },

  /**
   * Create bulk notifications for multiple users
   * @param {Array} notificationsArray - Array of notification objects
   * @returns {Promise<Object>} Bulk creation result
   */
  async createBulkNotifications(notificationsArray) {
    return new Promise((resolve, reject) => {
      if (!notificationsArray || notificationsArray.length === 0) {
        return resolve({ affectedRows: 0 });
      }

      Notification.createBulk(notificationsArray, (err, result) => {
        if (err) {
          console.error('Error creating bulk notifications:', err);
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  /**
   * Notify all students in a class
   * @param {number} classId - Class ID
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   * @param {Object} [additionalData] - Additional data (assignment_id, etc.)
   * @returns {Promise<Object>} Result
   */
  async notifyClassStudents(classId, message, type, additionalData = {}) {
    try {
      const promiseDb = db.promise();
      
      // Get all enrolled students
      const [students] = await promiseDb.query(
        'SELECT student_id FROM enrollments WHERE class_id = ?',
        [classId]
      );

      if (!students || students.length === 0) {
        return { affectedRows: 0 };
      }

      const notifications = students.map(student => ({
        user_id: student.student_id,
        message: message,
        notification_type: type,
        class_id: classId,
        assignment_id: additionalData.assignment_id || null,
        submission_id: additionalData.submission_id || null,
        scheduled_at: additionalData.scheduled_at || null
      }));

      return await this.createBulkNotifications(notifications);
    } catch (error) {
      console.error('Error notifying class students:', error);
      throw error;
    }
  },

  /**
   * Notify teacher about student submission
   * @param {number} teacherId - Teacher user ID
   * @param {string} studentName - Student name
   * @param {string} assignmentTitle - Assignment title
   * @param {number} assignmentId - Assignment ID
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Object>} Result
   */
  async notifyTeacherSubmission(teacherId, studentName, assignmentTitle, assignmentId, submissionId) {
    const message = `${studentName} submitted "${assignmentTitle}"`;
    
    return await this.createNotification({
      user_id: teacherId,
      message: message,
      notification_type: 'assignment_submitted',
      assignment_id: assignmentId,
      submission_id: submissionId
    });
  },

  /**
   * Notify student about grade
   * @param {number} studentId - Student user ID
   * @param {string} assignmentTitle - Assignment title
   * @param {number} grade - Grade received
   * @param {number} assignmentId - Assignment ID
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Object>} Result
   */
  async notifyStudentGraded(studentId, assignmentTitle, grade, assignmentId, submissionId) {
    const message = `Your assignment "${assignmentTitle}" has been graded: ${grade} points`;
    
    return await this.createNotification({
      user_id: studentId,
      message: message,
      notification_type: 'assignment_graded',
      assignment_id: assignmentId,
      submission_id: submissionId
    });
  },

  /**
   * Notify students about new assignment
   * @param {number} classId - Class ID
   * @param {string} assignmentTitle - Assignment title
   * @param {Date} dueDate - Due date
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Object>} Result
   */
  async notifyNewAssignment(classId, assignmentTitle, dueDate, assignmentId) {
    const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const message = `New assignment posted: "${assignmentTitle}" - Due: ${formattedDate}`;
    
    return await this.notifyClassStudents(
      classId,
      message,
      'assignment_created',
      { assignment_id: assignmentId }
    );
  },

  /**
   * Notify students about class creation
   * @param {number} classId - Class ID
   * @param {string} className - Class name
   * @param {string} teacherName - Teacher name
   * @param {Date} startTime - Class start time
   * @returns {Promise<Object>} Result
   */
  async notifyNewClass(classId, className, teacherName, startTime) {
    const formattedDate = new Date(startTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const message = `New class scheduled: "${className}" by ${teacherName} on ${formattedDate}`;
    
    return await this.notifyClassStudents(
      classId,
      message,
      'class_scheduled',
      {}
    );
  },

  /**
   * Notify students about class starting soon
   * @param {number} classId - Class ID
   * @param {string} className - Class name
   * @param {number} minutesBefore - Minutes before class starts
   * @returns {Promise<Object>} Result
   */
  async notifyClassReminder(classId, className, minutesBefore = 15) {
    const message = `Class "${className}" starts in ${minutesBefore} minutes!`;
    
    return await this.notifyClassStudents(
      classId,
      message,
      'class_reminder',
      {}
    );
  },

  /**
   * Notify student about enrollment confirmation
   * @param {number} studentId - Student ID
   * @param {string} className - Class name
   * @param {string} teacherName - Teacher name
   * @param {number} classId - Class ID
   * @returns {Promise<Object>} Result
   */
  async notifyEnrollment(studentId, className, teacherName, classId) {
    const message = `You have been enrolled in "${className}" taught by ${teacherName}`;
    
    return await this.createNotification({
      user_id: studentId,
      message: message,
      notification_type: 'enrollment_confirmation',
      class_id: classId
    });
  },

  /**
   * Notify about attendance marked
   * @param {number} studentId - Student ID
   * @param {string} className - Class name
   * @param {string} status - Attendance status (present/absent)
   * @param {number} classId - Class ID
   * @returns {Promise<Object>} Result
   */
  async notifyAttendanceMarked(studentId, className, status, classId) {
    const message = `Your attendance for "${className}" has been marked as ${status}`;
    
    return await this.createNotification({
      user_id: studentId,
      message: message,
      notification_type: 'attendance_marked',
      class_id: classId
    });
  },

  /**
   * Notify about message received
   * @param {number} receiverId - Receiver user ID
   * @param {string} senderName - Sender name
   * @param {string} senderRole - Sender role
   * @returns {Promise<Object>} Result
   */
  async notifyNewMessage(receiverId, senderName, senderRole) {
    const message = `New message from ${senderName} (${senderRole})`;
    
    return await this.createNotification({
      user_id: receiverId,
      message: message,
      notification_type: 'new_message'
    });
  },

  /**
   * Notify teacher when student joins class video call
   * @param {number} teacherId - Teacher ID
   * @param {string} studentName - Student name
   * @param {string} className - Class name
   * @param {number} classId - Class ID
   * @returns {Promise<Object>} Result
   */
  async notifyTeacherStudentJoined(teacherId, studentName, className, classId) {
    const message = `${studentName} joined the video call for "${className}"`;
    
    return await this.createNotification({
      user_id: teacherId,
      message: message,
      notification_type: 'student_joined_call',
      class_id: classId
    });
  },

  /**
   * Notify about assignment deadline approaching
   * @param {number} studentId - Student ID
   * @param {string} assignmentTitle - Assignment title
   * @param {Date} dueDate - Due date
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Object>} Result
   */
  async notifyAssignmentDeadline(studentId, assignmentTitle, dueDate, assignmentId) {
    const hoursLeft = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60));
    const message = `Reminder: "${assignmentTitle}" is due in ${hoursLeft} hours!`;
    
    return await this.createNotification({
      user_id: studentId,
      message: message,
      notification_type: 'assignment_deadline',
      assignment_id: assignmentId
    });
  },

  /**
   * Get notification count for user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId) {
    try {
      const promiseDb = db.promise();
      const [result] = await promiseDb.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
        [userId]
      );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
};

module.exports = notificationHelper;
