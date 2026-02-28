const db = require('./backend/config/db');

db.query('SELECT id,name,email,teacher_id,course_name FROM users WHERE role=?', ['student'], (err, results) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Total students:', results.length);
    console.log('Students with teacher assigned:', results.filter(s => s.teacher_id).length);
    results.forEach(s => {
      console.log(`- ${s.name} (id: ${s.id}, teacher_id: ${s.teacher_id}, course: ${s.course_name})`);
    });
  }
  process.exit();
});
