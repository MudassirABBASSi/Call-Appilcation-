const db = require('./config/db');

// Check classes and their teachers, and which students should be enrolled
const query = `
  SELECT 
    c.id as class_id,
    c.title as class_title,
    c.teacher_id,
    t.name as teacher_name,
    u.id as student_id,
    u.name as student_name,
    u.teacher_id as student_teacher_id,
    cs.student_id as is_enrolled_in_class
  FROM classes c
  LEFT JOIN users t ON c.teacher_id = t.id
  LEFT JOIN users u ON u.role = 'student' AND (u.teacher_id = c.teacher_id OR u.id IN (SELECT student_id FROM class_students WHERE class_id = c.id))
  LEFT JOIN class_students cs ON u.id = cs.student_id AND cs.class_id = c.id
  ORDER BY c.title, u.name
`;

db.query(query, (err, results) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
  
  console.log('\n=== CLASSES, TEACHERS, AND STUDENT ENROLLMENT ===\n');
  
  let currentClass = null;
  results.forEach(row => {
    if (!row.class_id) return;
    
    if (currentClass !== row.class_title) {
      console.log(`\n📚 CLASS: ${row.class_title} (ID: ${row.class_id})`);
      console.log(`   Teacher: ${row.teacher_name || 'UNKNOWN'} (ID: ${row.teacher_id})`);
      currentClass = row.class_title;
    }
    
    if (row.student_name) {
      const enrolled = row.is_enrolled_in_class ? '✅ ENROLLED' : '❌ NOT ENROLLED';
      const assigned = row.student_teacher_id === row.teacher_id ? '(Assigned to teacher)' : '';
      console.log(`   - ${row.student_name} ${enrolled} ${assigned}`);
    }
  });
  
  // Check students and their teacher assignments
  console.log('\n\n=== STUDENT-TEACHER ASSIGNMENTS ===\n');
  const studentQuery = `
    SELECT id, name, teacher_id, (SELECT name FROM users WHERE id = users.teacher_id) as assigned_teacher
    FROM users
    WHERE role = 'student'
    ORDER BY name
  `;
  
  db.query(studentQuery, (err2, students) => {
    if (err2) {
      console.error('Error:', err2.message);
      process.exit(1);
    }
    
    students.forEach(s => {
      console.log(`${s.name} -> Assigned Teacher: ${s.assigned_teacher || 'NONE'}`);
    });
    
    process.exit(0);
  });
});
