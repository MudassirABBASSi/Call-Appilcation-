const cron = require('node-cron');
const db = require('../config/db');
const Notification = require('../models/Notification');

/**
 * Assignment Reminder Cron Job
 * Runs every 5 minutes to check for upcoming assignment deadlines
 * Sends reminders at:
 * - 1 day before due date
 * - 3 hours before due date
 * - 30 minutes before due date
 * 
 * Only notifies students who have NOT submitted the assignment
 */

const startAssignmentReminderCron = () => {
  // Run every 5 minutes: */5 * * * *
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔔 Running assignment reminder check...');
    
    try {
      // Get all assignments with upcoming deadlines that need reminders
      const query = `
        SELECT 
          a.id as assignment_id,
          a.title,
          a.deadline,
          a.class_id,
          c.title as class_title,
          cs.student_id,
          u.name as student_name
        FROM assignments a
        JOIN classes c ON a.class_id = c.id
        JOIN class_students cs ON c.id = cs.class_id
        JOIN users u ON cs.student_id = u.id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = cs.student_id
        WHERE a.deadline IS NOT NULL
          AND a.deadline > NOW()
          AND s.id IS NULL  -- Student has NOT submitted
          AND u.role = 'student'
        ORDER BY a.deadline ASC
      `;
      
      db.query(query, async (err, assignments) => {
        if (err) {
          console.error('Error fetching assignments for reminders:', err);
          return;
        }
        
        if (!assignments || assignments.length === 0) {
          console.log('No pending assignments found for reminders.');
          return;
        }
        
        const now = new Date();
        const remindersToSend = [];
        
        // Check each assignment for reminder thresholds
        for (const assignment of assignments) {
          const deadline = new Date(assignment.deadline);
          const timeDiff = deadline - now; // milliseconds
          
          const oneDayMs = 24 * 60 * 60 * 1000;
          const threeHoursMs = 3 * 60 * 60 * 1000;
          const thirtyMinutesMs = 30 * 60 * 1000;
          
          let shouldRemind = false;
          let reminderType = '';
          
          // Check if we should send 1-day reminder (between 24h and 23h55m before)
          if (timeDiff <= oneDayMs && timeDiff > (oneDayMs - 5 * 60 * 1000)) {
            shouldRemind = true;
            reminderType = '1_day';
          }
          // Check if we should send 3-hour reminder (between 3h and 2h55m before)
          else if (timeDiff <= threeHoursMs && timeDiff > (threeHoursMs - 5 * 60 * 1000)) {
            shouldRemind = true;
            reminderType = '3_hours';
          }
          // Check if we should send 30-minute reminder (between 30m and 25m before)
          else if (timeDiff <= thirtyMinutesMs && timeDiff > (thirtyMinutesMs - 5 * 60 * 1000)) {
            shouldRemind = true;
            reminderType = '30_minutes';
          }
          
          if (shouldRemind) {
            // Check if we already sent this reminder type
            const checkQuery = `
              SELECT id FROM notifications 
              WHERE user_id = ? 
                AND assignment_id = ? 
                AND message LIKE ? 
                AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)
            `;
            
            const messagePattern = `%Reminder: Assignment "${assignment.title}"%`;
            
            await new Promise((resolve) => {
              db.query(checkQuery, [assignment.student_id, assignment.assignment_id, messagePattern], (checkErr, existing) => {
                if (!checkErr && (!existing || existing.length === 0)) {
                  // Format deadline date/time
                  const deadlineFormatted = deadline.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  let timeRemaining = '';
                  if (reminderType === '1_day') {
                    timeRemaining = '1 day';
                  } else if (reminderType === '3_hours') {
                    timeRemaining = '3 hours';
                  } else if (reminderType === '30_minutes') {
                    timeRemaining = '30 minutes';
                  }
                  
                  remindersToSend.push({
                    user_id: assignment.student_id,
                    assignment_id: assignment.assignment_id,
                    message: `Reminder: Assignment "${assignment.title}" is due in ${timeRemaining} at ${deadlineFormatted}`,
                    notification_type: 'assignment_created'
                  });
                }
                resolve();
              });
            });
          }
        }
        
        // Send all reminders in bulk
        if (remindersToSend.length > 0) {
          Notification.createBulk(remindersToSend, (notifErr) => {
            if (notifErr) {
              console.error('Error sending reminder notifications:', notifErr);
            } else {
              console.log(`✅ Sent ${remindersToSend.length} assignment reminder(s)`);
            }
          });
        } else {
          console.log('No reminders needed at this time.');
        }
      });
      
    } catch (error) {
      console.error('Error in assignment reminder cron job:', error);
    }
  });
  
  console.log('✅ Assignment reminder cron job started (runs every 5 minutes)');
};

module.exports = { startAssignmentReminderCron };
