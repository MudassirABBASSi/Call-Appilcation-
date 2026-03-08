/**
 * Simple migration to update notification_type ENUM
 */

const db = require('./config/db');

async function updateNotificationTypes() {
  try {
    console.log('🔄 Updating notification_type ENUM column...\n');

    const promiseDb = db.promise();

    // First, check current ENUM values
    console.log('1️⃣  Checking current notification_type values...');
    const [currentEnum] = await promiseDb.query(
      "SHOW COLUMNS FROM notifications WHERE Field = 'notification_type'"
    );
    
    console.log('Current type:', currentEnum[0].Type);
    console.log('');

    // Update the ENUM to include all new types
    console.log('2️⃣  Updating ENUM with all notification types...');
    await promiseDb.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN notification_type ENUM(
        'general',
        'class_scheduled',
        'class_reminder',
        'class_cancelled',
        'enrollment_confirmation',
        'assignment_created',
        'assignment_submitted',
        'assignment_graded',
        'assignment_deadline',
        'attendance_marked',
        'new_message',
        'student_joined_call',
        'teacher_announcement',
        'reminder'
      ) DEFAULT 'general'
    `);

    console.log('✅ Successfully updated notification_type ENUM\n');

    // Verify the update
    console.log('3️⃣  Verifying update...');
    const [updatedEnum] = await promiseDb.query(
      "SHOW COLUMNS FROM notifications WHERE Field = 'notification_type'"
    );
    
    const enumValues = updatedEnum[0].Type.match(/enum\((.*)\)/)[1]
      .split(',')
      .map(v => v.replace(/'/g, '').trim());
      
    console.log('✅ Updated notification types:');
    enumValues.forEach((type, index) => {
      console.log(`   ${index + 1}. ${type}`);
    });
    console.log('');
    console.log(`✅ Total: ${enumValues.length} notification types supported\n`);

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\nError Details:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    if (error.sql) {
      console.error('  SQL:', error.sql);
    }
    process.exit(1);
  }
}

updateNotificationTypes();
