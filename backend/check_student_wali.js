const db = require('./config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

async function checkStudent() {
  try {
    console.log('🔍 CHECKING STUDENT "WALI"\n');
    
    // Find student
    const students = await query('SELECT id, name, email, teacher_id FROM users WHERE name LIKE "%WALI%" OR name LIKE "%Wali%" OR name LIKE "%wali%"');
    
    if (!students || students.length === 0) {
      console.log('❌ No student found matching "WALI"');
      console.log('\nAll students in system:');
      const allStudents = await query('SELECT id, name, teacher_id FROM users WHERE role = "student"');
      console.table(allStudents);
      process.exit(1);
    }
    
    const student = students[0];
    console.log(`✅ Found: ${student.name} (ID: ${student.id})`);
    console.log(`   Teacher ID: ${student.teacher_id}`);
    
    // Get teacher info
    if (student.teacher_id) {
      const teacher = await query('SELECT id, name FROM users WHERE id = ?', [student.teacher_id]);
      if (teacher && teacher.length > 0) {
        console.log(`   Teacher: ${teacher[0].name}\n`);
        
        // Get teacher's classes
        const classes = await query('SELECT id, title FROM classes WHERE teacher_id = ?', [student.teacher_id]);
        console.log(`📚 Teacher's classes (${classes.length}):`);
        console.table(classes);
        
        // Check student enrollments
        const enrollments = await query(`
          SELECT cs.class_id, c.title 
          FROM class_students cs
          JOIN classes c ON cs.class_id = c.id
          WHERE cs.student_id = ?
        `, [student.id]);
        
        console.log(`\n📝 Student's current enrollments (${enrollments.length}):`);
        if (enrollments && enrollments.length > 0) {
          console.table(enrollments);
        } else {
          console.log('   ❌ NONE');
        }
        
        // Find missing
        const enrolledIds = enrollments.map(e => e.class_id);
        const missing = classes.filter(c => !enrolledIds.includes(c.id));
        
        if (missing.length > 0) {
          console.log(`\n🔴 MISSING ENROLLMENTS (${missing.length}):`);
          console.table(missing);
        }
      }
    } else {
      console.log('   ❌ No teacher assigned to this student!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStudent();
