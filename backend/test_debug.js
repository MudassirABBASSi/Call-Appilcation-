const db = require('./config/db');

// First, find mudassir's ID and verify data
const query1 = `
  SELECT u.id, u.name, COUNT(cs.class_id) as enrolled_classes
  FROM users u
  LEFT JOIN class_students cs ON u.id = cs.student_id
  WHERE u.name = 'mudassir' AND u.role = 'student'
  GROUP BY u.id, u.name
`;

db.query(query1, (err, students) => {
  if (err || !students || students.length === 0) {
    console.error('❌ Student not found or error:', err?.message || 'not found');
    process.exit(1);
  }
  
  const student = students[0];
  console.log(`\n✅ Found: ${student.name} (ID: ${student.id})`);
  console.log(`   Enrolled in ${student.enrolled_classes} classes\n`);
  
  // Now check assignments
  const query2 = `
    SELECT 
      c.id as class_id,
      c.title as class_title,
      COUNT(a.id) as assignments_in_class
    FROM class_students cs
    LEFT JOIN classes c ON cs.class_id = c.id
    LEFT JOIN assignments a ON c.id = a.class_id
    WHERE cs.student_id = ?
    GROUP BY c.id, c.title
    ORDER BY c.title
  `;
  
  db.query(query2, [student.id], (err2, classes) => {
    if (err2) {
      console.error('Error:', err2.message);
      process.exit(1);
    }
    
    console.log('📚 CLASSES AND ASSIGNMENTS:\n');
    classes.forEach(cls => {
      console.log(`${cls.class_title}: ${cls.assignments_in_class} assignment(s)`);
    });
    
    // Finally, get all assignments for the student
    const query3 = `
      SELECT a.id, a.title, c.title as class_title
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      JOIN class_students cs ON c.id = cs.class_id
      WHERE cs.student_id = ?
    `;
    
    db.query(query3, [student.id], (err3, assignments) => {
      if (err3) {
        console.error('Error:', err3.message);
        process.exit(1);
      }
      
      console.log(`\n\n✅ ASSIGNMENTS VISIBLE TO ${student.name}:\n`);
      if (assignments.length === 0) {
        console.log('❌ No assignments yet');
      } else {
        assignments.forEach((a, idx) => {
          console.log(`${idx + 1}. "${a.title}" → ${a.class_title}`);
        });
      }
      
      process.exit(0);
    });
  });
});
