const db = require('./config/db');

// Test: Get all assignments visible to mudassir (student)
const studentId = 3; // mudassir's ID (based on earlier query)

const query = `
  SELECT a.id, a.title as assignment_title, c.title as class_title, u.name as teacher_name
  FROM assignments a
  JOIN classes c ON a.class_id = c.id
  JOIN users u ON a.teacher_id = u.id
  JOIN class_students cs ON a.class_id = cs.class_id
  WHERE cs.student_id = ?
  ORDER BY a.deadline DESC
`;

db.query(query, [studentId], (err, assignments) => {
  if (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
  
  console.log('\n🎓 MUDASSIR\'S VISIBLE ASSIGNMENTS\n');
  
  if (assignments.length === 0) {
    console.log('❌ No assignments visible');
  } else {
    console.log(`✅ ${assignments.length} assignment(s) visible:\n`);
    assignments.forEach((a, idx) => {
      console.log(`${idx + 1}. "${a.assignment_title}"`);
      console.log(`   Class: ${a.class_title} (Teacher: ${a.teacher_name})\n`);
    });
  }
  
  process.exit(0);
});
