const db = require('./config/db');

console.log('Checking database status...\n');

// Check students
db.query('SELECT id, name, email FROM users WHERE role="student" LIMIT 5', (err, students) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  
  console.log('=== STUDENTS ===');
  console.table(students);
  
  // Check classes
  db.query('SELECT id, title, teacher_id FROM classes LIMIT 5', (err2, classes) => {
    if (err2) {
      console.error('Error:', err2);
      process.exit(1);
    }
    
    console.log('\n=== CLASSES ===');
    console.table(classes);
    
    // Check assignments
    db.query('SELECT id, title, class_id FROM assignments ORDER BY created_at DESC LIMIT 5', (err3, assignments) => {
      if (err3) {
        console.error('Error:', err3);
        process.exit(1);
      }
      
      console.log('\n=== ASSIGNMENTS ===');
      console.table(assignments);
      
      // Check enrollments
      db.query('SELECT * FROM class_students', (err4, enrollments) => {
        if (err4) {
          console.error('Error:', err4);
          process.exit(1);
        }
        
        console.log('\n=== CLASS ENROLLMENTS (class_students table) ===');
        console.log('Total enrollments:', enrollments.length);
        console.table(enrollments);
        
        console.log('\n❌ PROBLEM: Students need to be enrolled in classes!');
        console.log('Students can only see assignments for classes they are enrolled in.');
        console.log('The class_students table links students to classes.');
        
        process.exit(0);
      });
    });
  });
});
