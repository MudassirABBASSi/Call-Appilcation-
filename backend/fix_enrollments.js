const db = require('./config/db');

console.log('🔧 FIXING STUDENT ENROLLMENTS\n');

// Enroll all students in all classes
const fixEnrollmentsQuery = `
  INSERT INTO class_students (class_id, student_id)
  SELECT c.id, u.id
  FROM classes c
  CROSS JOIN users u
  WHERE u.role = 'student'
  AND NOT EXISTS (
    SELECT 1 FROM class_students cs 
    WHERE cs.class_id = c.id AND cs.student_id = u.id
  )
`;

db.query(fixEnrollmentsQuery, (err, result) => {
  if (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
  
  console.log(`✅ Successfully enrolled students in classes`);
  console.log(`   Rows affected: ${result.affectedRows}`);
  
  // Verify the fix
  const verifyQuery = `
    SELECT 
      c.title as class_title,
      COUNT(DISTINCT cs.student_id) as enrolled_count,
      (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students
    FROM classes c
    LEFT JOIN class_students cs ON c.id = cs.class_id
    GROUP BY c.id, c.title
    ORDER BY c.title
  `;
  
  db.query(verifyQuery, (err2, results) => {
    if (err2) {
      console.error('Error verifying:', err2.message);
      process.exit(1);
    }
    
    console.log('\n📊 ENROLLMENT SUMMARY:\n');
    results.forEach(row => {
      const status = row.enrolled_count === row.total_students ? '✅' : '⚠️';
      console.log(`${status} ${row.class_title}: ${row.enrolled_count}/${row.total_students} students`);
    });
    
    process.exit(0);
  });
});
