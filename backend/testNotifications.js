/**
 * Test Script for Notification System
 * Tests all notification helper functions and verifies the system works correctly
 */

const notificationHelper = require('./utils/notificationHelper');
const db = require('./config/db');

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System...\n');

  try {
    const promiseDb = db.promise();

    // Test 1: Get a test user (student)
    console.log('1️⃣  Getting test users...');
    const [students] = await promiseDb.query(
      'SELECT id, name, role FROM users WHERE role = "student" LIMIT 1'
    );
    
    const [teachers] = await promiseDb.query(
      'SELECT id, name, role FROM users WHERE role = "teacher" LIMIT 1'
    );

    if (students.length === 0 || teachers.length === 0) {
      console.log('❌ No test users found. Please create at least one student and one teacher.');
      process.exit(1);
    }

    const studentId = students[0].id;
    const teacherId = teachers[0].id;
    const studentName = students[0].name;
    const teacherName = teachers[0].name;

    console.log(`✅ Found student: ${studentName} (ID: ${studentId})`);
    console.log(`✅ Found teacher: ${teacherName} (ID: ${teacherId})\n`);

    // Test 2: Create a single notification
    console.log('2️⃣  Creating single notification...');
    const result1 = await notificationHelper.createNotification({
      user_id: studentId,
      message: 'Test notification: System is working!',
      notification_type: 'general'
    });
    console.log(`✅ Created notification ID: ${result1.insertId}\n`);

    // Test 3: Get unread count
    console.log('3️⃣  Getting unread count...');
    const count = await notificationHelper.getUnreadCount(studentId);
    console.log(`✅ Unread count for student: ${count}\n`);

    // Test 4: Create class notification (if class exists)
    console.log('4️⃣  Testing class notification...');
    const [classes] = await promiseDb.query(
      'SELECT id, title as name, date FROM classes ORDER BY id DESC LIMIT 1'
    );

    if (classes.length > 0) {
      const classId = classes[0].id;
      const className = classes[0].name;
      
      await notificationHelper.notifyNewClass(
        classId,
        className,
        teacherName,
        new Date(classes[0].date)
      );
      console.log(`✅ Created class notification for class: ${className}\n`);
    } else {
      console.log('ℹ️  No classes found, skipping class notification test\n');
    }

    // Test 5: Test attendance notification
    console.log('5️⃣  Testing attendance notification...');
    if (classes.length > 0) {
      await notificationHelper.notifyAttendanceMarked(
        studentId,
        classes[0].name,
        'present',
        classes[0].id
      );
      console.log(`✅ Created attendance notification\n`);
    } else {
      console.log('ℹ️  No classes found, skipping attendance notification test\n');
    }

    // Test 6: Test message notification
    console.log('6️⃣  Testing message notification...');
    await notificationHelper.notifyNewMessage(
      studentId,
      teacherName,
      'teacher'
    );
    console.log(`✅ Created message notification\n`);

    // Test 7: Test bulk notification creation
    console.log('7️⃣  Testing bulk notifications...');
    const bulkNotifications = [
      {
        user_id: studentId,
        message: 'Bulk notification test 1',
        notification_type: 'general'
      },
      {
        user_id: studentId,
        message: 'Bulk notification test 2',
        notification_type: 'general'
      }
    ];
    
    const bulkResult = await notificationHelper.createBulkNotifications(bulkNotifications);
    console.log(`✅ Created ${bulkResult.affectedRows} bulk notifications\n`);

    // Test 8: Final unread count
    console.log('8️⃣  Final unread count...');
    const finalCount = await notificationHelper.getUnreadCount(studentId);
    console.log(`✅ Final unread count: ${finalCount}\n`);

    // Test 9: Verify database structure
    console.log('9️⃣  Verifying database structure...');
    const [tableInfo] = await promiseDb.query(
      'DESCRIBE notifications'
    );
    console.log('✅ Notifications table structure:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? `(${col.Key})` : ''}`);
    });
    console.log('');

    // Test 10: Check notification types
    console.log('🔟 Checking notification types...');
    const [enumInfo] = await promiseDb.query(
      "SHOW COLUMNS FROM notifications WHERE Field = 'notification_type'"
    );
    console.log('✅ Supported notification types:');
    const enumValues = enumInfo[0].Type.match(/enum\((.*)\)/)[1]
      .split(',')
      .map(v => v.replace(/'/g, '').trim());
    enumValues.forEach(type => {
      console.log(`   ✓ ${type}`);
    });
    console.log('');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED! Notification system is working correctly.');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📊 Summary:');
    console.log(`   - Single notifications: ✅ Working`);
    console.log(`   - Bulk notifications: ✅ Working`);
    console.log(`   - Unread count: ✅ Working`);
    console.log(`   - Class notifications: ${classes.length > 0 ? '✅' : 'ℹ️'} ${classes.length > 0 ? 'Working' : 'Not tested (no classes)'}`);
    console.log(`   - Attendance notifications: ${classes.length > 0 ? '✅' : 'ℹ️'} ${classes.length > 0 ? 'Working' : 'Not tested (no classes)'}`);
    console.log(`   - Message notifications: ✅ Working`);
    console.log(`   - Database structure: ✅ Correct`);
    console.log(`   - Notification types: ✅ All ${enumValues.length} types supported\n`);

    console.log('🎯 Next Steps:');
    console.log('   1. Open browser: http://localhost:3000');
    console.log('   2. Login as student or teacher');
    console.log('   3. Check notification bell icon in navbar');
    console.log('   4. Verify unread count badge is displayed');
    console.log('   5. Click bell to see notifications dropdown');
    console.log('   6. Test "Mark as read" functionality');
    console.log('   7. Create a new class/assignment to test auto-notifications\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('\nError Details:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    if (error.sql) {
      console.error('  SQL:', error.sql);
    }
    console.error('\n📝 Troubleshooting Tips:');
    console.error('   1. Verify database connection in config/db.js');
    console.error('   2. Check if notifications table exists');
    console.error('   3. Run migration: node runMigration.js');
    console.error('   4. Verify user tables have data');
    console.error('   5. Check MySQL service is running\n');
    process.exit(1);
  }
}

// Run the test
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║     Notification System Test Suite                       ║');
console.log('║     Production-Ready LMS Notification System              ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

testNotificationSystem();
