/**
 * Class Reminder Cron Job
 * STEP 6: Sends reminders to students before class starts
 * 
 * Runs every 5 minutes
 * Sends notifications at:
 *   - 30 minutes before class (+/- 2 min tolerance)
 *   - 15 minutes before class (+/- 2 min tolerance)
 */

const cron = require('node-cron');
const db = require('../config/db');
const notificationHelper = require('../utils/notificationHelper');

/**
 * Start the class reminder cron job
 */
const startClassReminderCron = () => {
  // Run every 5 minutes: */5 * * * *
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('⏰ Running class reminder cron job...');
      
      const promiseDb = db.promise();
      
      // STEP 1: Fetch all upcoming classes
      // Get classes that are scheduled for the future (start_time > NOW())
      const [upcomingClasses] = await promiseDb.query(
        `SELECT 
          id, 
          title, 
          start_time, 
          teacher_id,
          TIMESTAMPDIFF(MINUTE, NOW(), start_time) AS minutes_until_start
         FROM classes 
         WHERE start_time > NOW()
         AND start_time <= DATE_ADD(NOW(), INTERVAL 35 MINUTE)
         ORDER BY start_time ASC`
      );

      if (upcomingClasses.length === 0) {
        console.log('✅ No upcoming classes in the next 35 minutes');
        return;
      }

      console.log(`📚 Found ${upcomingClasses.length} upcoming class(es)`);

      // STEP 2 & 3: Process each class and check reminder windows
      for (const classData of upcomingClasses) {
        const minutesUntil = classData.minutes_until_start;
        let reminderMinutes = null;
        
        // Check if class is in 30-minute window (28-32 min range = +/- 2 min tolerance)
        if (minutesUntil >= 28 && minutesUntil <= 32) {
          reminderMinutes = 30;
        } 
        // Check if class is in 15-minute window (13-17 min range = +/- 2 min tolerance)
        else if (minutesUntil >= 13 && minutesUntil <= 17) {
          reminderMinutes = 15;
        }

        // If not in any reminder window, skip this class
        if (!reminderMinutes) {
          continue;
        }

        console.log(`⏱️  Class "${classData.title}" starts in ${minutesUntil} minutes (${reminderMinutes}-min reminder window)`);

        // STEP 3: Fetch enrolled students
        const [enrolledStudents] = await promiseDb.query(
          `SELECT user_id, users.name 
           FROM class_students 
           INNER JOIN users ON class_students.user_id = users.id
           WHERE class_students.class_id = ?`,
          [classData.id]
        );

        if (enrolledStudents.length === 0) {
          console.log(`  ℹ️  No students enrolled in class "${classData.title}"`);
          continue;
        }

        console.log(`  👥 ${enrolledStudents.length} student(s) enrolled`);

        // STEP 4 & 5: Create notifications with duplicate prevention
        let notificationsSent = 0;
        let duplicatesPrevented = 0;

        for (const student of enrolledStudents) {
          try {
            const message = `Class "${classData.title}" starts in ${reminderMinutes} minutes.`;
            
            const result = await notificationHelper.createNotification({
              user_id: student.user_id,
              message: message,
              notification_type: 'class_reminder',
              class_id: classData.id
            });

            if (result.duplicate_prevented) {
              duplicatesPrevented++;
            } else {
              notificationsSent++;
            }
          } catch (notifError) {
            console.error(`  ⚠️  Failed to notify student ${student.name} (ID: ${student.user_id}):`, notifError.message);
          }
        }

        console.log(`  ✅ Reminders: ${notificationsSent} sent, ${duplicatesPrevented} duplicate(s) prevented`);
      }

      console.log('✅ Class reminder cron job completed\n');
      
    } catch (error) {
      console.error('❌ Error in class reminder cron job:', error);
    }
  });

  console.log('✅ Class reminder cron job started (runs every 5 minutes)');
};

module.exports = { startClassReminderCron };
