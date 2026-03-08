const db = require('./config/db');

const assignmentId = 28;
const query = `
  SELECT 
    u.id as student_id,
    u.name as student_name,
    u.email as student_email,
    s.id as submission_id,
    s.id as id,
    s.file_url,
    s.submitted_at,
    s.marks,
    s.feedback,
    CASE
      WHEN s.id IS NULL THEN 'pending'
      ELSE s.status
    END as status
  FROM class_students cs
  JOIN users u ON cs.student_id = u.id
  JOIN assignments a ON cs.class_id = a.class_id
  LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = u.id
  WHERE a.id = ? AND u.role = 'student'
  ORDER BY u.name ASC
`;

console.log('Testing submission query for assignment ID:', assignmentId);
console.log('Query:', query);

db.query(query, [assignmentId], (err, results) => {
  if (err) {
    console.error('❌ Query Error:', err.message);
    console.error('SQL State:', err.sqlState);
    console.error('Error Code:', err.code);
  } else {
    console.log('✅ Found', results.length, 'students for assignment', assignmentId);
    if (results.length > 0) {
      console.log('\nResults:');
      console.table(results);
    }
  }
  process.exit();
});
