const mysql = require('mysql2/promise');

async function runMigration() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'abbassi32304',
      database: process.env.DB_NAME || 'alburhan_classroom'
    });
    
    console.log('✓ Connected to database');
    console.log('Running database migration...\n');
    
    const migrations = [
      { name: "Add start_time to classes", sql: "ALTER TABLE classes ADD COLUMN start_time DATETIME" },
      { name: "Add end_time to classes", sql: "ALTER TABLE classes ADD COLUMN end_time DATETIME" },
      { name: "Add is_active to classes", sql: "ALTER TABLE classes ADD COLUMN is_active BOOLEAN DEFAULT TRUE" },
      { 
        name: "Create enrollments table", 
        sql: `CREATE TABLE IF NOT EXISTS enrollments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          class_id INT NOT NULL,
          student_id INT NOT NULL,
          enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_enrollment (class_id, student_id),
          INDEX idx_student_id (student_id),
          INDEX idx_class_id (class_id)
        )`
      },
      { 
        name: "Create notifications table", 
        sql: `CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          class_id INT,
          message TEXT NOT NULL,
          notification_type ENUM('class_reminder', 'enrollment_confirmation', 'general') DEFAULT 'general',
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          scheduled_at DATETIME,
          sent_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
          INDEX idx_user_id (user_id),
          INDEX idx_is_read (is_read),
          INDEX idx_scheduled_at (scheduled_at)
        )`
      },
      {
        name: "Create courses table",
        sql: `CREATE TABLE IF NOT EXISTS courses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          teacher_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_teacher_id (teacher_id)
        )`
      },
      {
        name: "Create course_enrollments table",
        sql: `CREATE TABLE IF NOT EXISTS course_enrollments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          course_id INT NOT NULL,
          student_id INT NOT NULL,
          enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_course_enrollment (course_id, student_id),
          INDEX idx_student_id (student_id),
          INDEX idx_course_id (course_id)
        )`
      },
      {
        name: "Create assignments table",
        sql: `CREATE TABLE IF NOT EXISTS assignments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          file_url VARCHAR(500),
          total_marks INT DEFAULT 100,
          due_date DATETIME,
          day_of_week VARCHAR(20),
          course_id INT NOT NULL,
          teacher_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
          FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_course_id (course_id),
          INDEX idx_teacher_id (teacher_id),
          INDEX idx_due_date (due_date)
        )`
      },
      {
        name: "Create submissions table",
        sql: `CREATE TABLE IF NOT EXISTS submissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          assignment_id INT NOT NULL,
          student_id INT NOT NULL,
          file_url VARCHAR(500),
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          marks_obtained INT,
          feedback TEXT,
          graded BOOLEAN DEFAULT FALSE,
          FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_submission (assignment_id, student_id),
          INDEX idx_student_id (student_id),
          INDEX idx_assignment_id (assignment_id),
          INDEX idx_graded (graded)
        )`
      }
    ];
    
    for (const migration of migrations) {
      try {
        await connection.execute(migration.sql);
        console.log(`✓ ${migration.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`✓ ${migration.name} (already exists)`);
        } else if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`✓ ${migration.name} (already exists)`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n✅ All migrations completed successfully!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
