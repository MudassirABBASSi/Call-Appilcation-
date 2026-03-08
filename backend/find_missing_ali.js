const db = require('./config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

async function findMissing() {
  try {
    console.log('🔍 FINDING REMAINING MISSING ENROLLMENTS FOR TEACHER ALI\n');
    
    // Get teacher Ali (ID 5)
    const classes = await query('SELECT id, title FROM classes WHERE teacher_id = 5');
    const students = await query('SELECT id, name FROM users WHERE teacher_id = 5 AND role = "student"');
    
    console.log(`📚 Teacher Ali has ${classes.length} classes:`);
    classes.forEach(c => console.log(`   - ${c.id}: ${c.title}`));
    
    console.log(`\n👥 Teacher Ali has ${students.length} students:`);
    
    const missingList = [];
    
    for (const student of students) {
      console.log(`\n  ${student.name} (ID: ${student.id}):`);
      const enrollments = await query(`
        SELECT class_id FROM class_students 
        WHERE student_id = ? AND class_id IN (SELECT id FROM classes WHERE teacher_id = 5)
      `, [student.id]);
      
      const enrolledIds = enrollments.map(e => e.class_id);
      
      for (const cls of classes) {
        if (enrolledIds.includes(cls.id)) {
          console.log(`     ✅ ${cls.title}`);
        } else {
          console.log(`     ❌ ${cls.title}`);
          missingList.push({
            student_id: student.id,
            student_name: student.name,
            class_id: cls.id,
            class_name: cls.title
          });
        }
      }
    }
    
    if (missingList.length > 0) {
      console.log('\n🔴 MISSING ENROLLMENTS:');
      console.table(missingList);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findMissing();
