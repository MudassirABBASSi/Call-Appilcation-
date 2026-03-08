const db = require('./config/db');

// Check assignments and enrollment
const query = `
  SELECT 
    u.id as student_id,
    u.name as student_name,
    a.id as assignment_id,
    a.title as assignment_title,
    c.id as class_id,
    c.title as class_title,
    cs.student_id as enrolled_student_id
  FROM users u
  LEFT JOIN class_students cs ON u.id = cs.student_id
  LEFT JOIN classes c ON cs.class_id = c.id
  LEFT JOIN assignments a ON c.id = a.class_id
  WHERE u.role = 'student'
  ORDER BY u.name, c.title, a.title
`;

db.query(query, (err, results) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
  
  console.log('\n=== STUDENT ENROLLMENT AND ASSIGNMENTS ===\n');
  results.forEach(row => {
    console.log(`Student: ${row.student_name}, Class: ${row.class_title || 'NOT ENROLLED'}, Assignment: ${row.assignment_title || 'NONE'}`);
  });
  
  console.log('\n=== SUMMARY ===');
  const students = [...new Set(results.map(r => r.student_name))];
  students.forEach(studentName => {
    const studentRows = results.filter(r => r.student_name === studentName);
    const enrolledClasses = [...new Set(studentRows.filter(r => r.class_id).map(r => r.class_title))];
    const visibleAssignments = studentRows.filter(r => r.enrolled_student_id && r.assignment_id);
    
    console.log(`\n${studentName}:`);
    console.log(`  Enrolled in: ${enrolledClasses.length > 0 ? enrolledClasses.join(', ') : 'NO CLASSES'}`);
    console.log(`  Can see assignments: ${visibleAssignments.length}`);
  });
  
  process.exit(0);
});
