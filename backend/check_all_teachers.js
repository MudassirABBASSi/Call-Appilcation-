const db = require('./config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

async function checkAllTeachers() {
  try {
    console.log('🌍 CHECKING ALL TEACHERS IN THE SYSTEM\n');
    
    // Get all teachers
    const teachers = await query('SELECT id, name FROM users WHERE role = "teacher"');
    
    if (!teachers || teachers.length === 0) {
      console.log('No teachers found');
      process.exit(0);
    }
    
    console.log(`Found ${teachers.length} teacher(s)\n`);
    
    let allIssues = [];
    
    for (const teacher of teachers) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`👨‍🏫 TEACHER: ${teacher.name} (ID: ${teacher.id})`);
      console.log('='.repeat(60));
      
      // Get classes
      const classes = await query('SELECT id, title FROM classes WHERE teacher_id = ?', [teacher.id]);
      if (!classes || classes.length === 0) {
        console.log('  ℹ️  No classes created yet');
        continue;
      }
      
      console.log(`  📚 Classes: ${classes.map(c => c.title).join(', ')}`);
      
      // Get assigned students
      const students = await query('SELECT id, name FROM users WHERE teacher_id = ? AND role = "student"', [teacher.id]);
      
      if (!students || students.length === 0) {
        console.log('  ℹ️  No students assigned');
        continue;
      }
      
      console.log(`  👥 Students: ${students.map(s => s.name).join(', ')}`);
      
      // Check enrollments
      console.log('\n  📝 Enrollment Check:');
      let teacherIssues = [];
      
      for (const student of students) {
        const enrollments = await query(`
          SELECT DISTINCT cs.class_id 
          FROM class_students cs
          WHERE cs.student_id = ?
        `, [student.id]);
        
        const enrolledClassIds = enrollments ? enrollments.map(e => e.class_id) : [];
        let status = '✅';
        let issues = [];
        
        for (const cls of classes) {
          if (!enrolledClassIds.includes(cls.id)) {
            status = '❌';
            issues.push(cls.id);
            teacherIssues.push({
              teacher_id: teacher.id,
              teacher_name: teacher.name,
              student_id: student.id,
              student_name: student.name,
              class_id: cls.id,
              class_name: cls.title
            });
          }
        }
        
        console.log(`    ${status} ${student.name} (Missing: ${issues.length > 0 ? classes.filter(c => issues.includes(c.id)).map(c => c.title).join(', ') : 'None'})`);
      }
      
      if (teacherIssues.length === 0) {
        console.log('\n  ✨ All enrollments OK!');
      }
      
      allIssues = [...allIssues, ...teacherIssues];
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    
    if (allIssues.length === 0) {
      console.log('✨ All teachers and students have correct enrollments!');
    } else {
      console.log(`🔴 Found ${allIssues.length} missing enrollments:\n`);
      console.table(allIssues);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAllTeachers();
