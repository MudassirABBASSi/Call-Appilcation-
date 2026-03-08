/**
 * Run database migration for notifications table
 * This script updates the notifications table with expanded notification types
 */

const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Starting database migration for notifications table...\n');

    // Read the SQL migration file
    const migrationPath = path.join(__dirname, 'migrations', 'update_notifications_table.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and filter out empty statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    const promiseDb = db.promise();

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comment lines
      if (statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }

      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await promiseDb.query(statement);
        console.log(`✅ Statement ${i + 1} executed successfully\n`);
      } catch (error) {
        // Some errors are expected (like table not existing for backup)
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
            error.code === 'ER_DUP_FIELDNAME' ||
            error.message.includes('doesn\'t exist')) {
          console.log(`ℹ️  Statement ${i + 1} skipped (table already exists or doesn't need update)\n`);
          continue;
        }
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        throw error;
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('\nNotification types now supported:');
    console.log('  - general');
    console.log('  - class_scheduled');
    console.log('  - class_reminder');
    console.log('  - class_cancelled');
    console.log('  - enrollment_confirmation');
    console.log('  - assignment_created');
    console.log('  - assignment_submitted');
    console.log('  - assignment_graded');
    console.log('  - assignment_deadline');
    console.log('  - attendance_marked');
    console.log('  - new_message');
    console.log('  - student_joined_call');
    console.log('  - teacher_announcement\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
