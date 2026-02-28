const db = require('./backend/config/db');

// Get teacher ID 5 and check their students
db.query('SELECT id, name, email, phone, course_name, teacher_id FROM users WHERE role=? AND teacher_id=?', ['student', 5], (err, results) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Students assigned to teacher 5:');
    console.log('Total:', results.length);
    results.forEach(s => {
      console.log(`✓ ${s.name} - ${s.email} - Course: ${s.course_name}`);
    });
  }
  process.exit();
});
