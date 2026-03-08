const db = require('./config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

async function fixAllTeachers() {
  try {
    console.log('🔧 AUTO-FIXING ALL MISSING ENROLLMENTS (ALL TEACHERS)\n');
    
    // Issues found for teacher Ali (ID 5):
    const enrollments = [
      // mudassir abbassi (ID 14) missing from:
      { student_id: 14, student_name: 'mudassir abbassi', class_id: 2, class_name: 'Quran' },
      { student_id: 14, student_name: 'mudassir abbassi', class_id: 11, class_name: 'CHEM' },
      { student_id: 14, student_name: 'mudassir abbassi', class_id: 15, class_name: 'URDU' },
      { student_id: 14, student_name: 'mudassir abbassi', class_id: 16, class_name: 'PHY' },
      { student_id: 14, student_name: 'mudassir abbassi', class_id: 17, class_name: 'URDU' },
      // abbassi (ID 15) missing from:
      { student_id: 15, student_name: 'abbassi', class_id: 2, class_name: 'Quran' },
      { student_id: 15, student_name: 'abbassi', class_id: 11, class_name: 'CHEM' },
      { student_id: 15, student_name: 'abbassi', class_id: 12, class_name: 'CHEM' },
      { student_id: 15, student_name: 'abbassi', class_id: 13, class_name: 'BIO' },
      { student_id: 15, student_name: 'abbassi', class_id: 16, class_name: 'PHY' },
      { student_id: 15, student_name: 'abbassi', class_id: 17, class_name: 'URDU' }
    ];
    
    console.log(`🔄 Processing ${enrollments.length} enrollments for Teacher Ali...\n`);
    
    let count = 0;
    for (const enrollment of enrollments) {
      try {
        await query(
          'INSERT INTO class_students (class_id, student_id) VALUES (?, ?)',
          [enrollment.class_id, enrollment.student_id]
        );
        console.log(`✅ ${enrollment.student_name} → ${enrollment.class_name}`);
        count++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  ${enrollment.student_name} → ${enrollment.class_name} (already enrolled)`);
        } else {
          console.log(`❌ Error: ${err.message}`);
        }
      }
    }
    
    console.log(`\n✨ Fixed ${count} enrollments for Teacher Ali!\n`);
    
    // Final verification
    console.log('📝 FINAL VERIFICATION:\n');
    
    const teachers = await query('SELECT id, name FROM users WHERE role = "teacher"');
    let totalIssues = 0;
    
    for (const teacher of teachers) {
      const classes = await query('SELECT id, title FROM classes WHERE teacher_id = ?', [teacher.id]);
      const students = await query('SELECT id, name FROM users WHERE teacher_id = ? AND role = "student"', [teacher.id]);
      
      if (!classes || !students || classes.length === 0 || students.length === 0) continue;
      
      let teacherIssues = 0;
      for (const student of students) {
        const enrollments = await query(`
          SELECT COUNT(*) as count FROM class_students 
          WHERE student_id = ? AND class_id IN (SELECT id FROM classes WHERE teacher_id = ?)
        `, [student.id, teacher.id]);
        
        const enrolledCount = enrollments[0].count;
        if (enrolledCount !== classes.length) {
          teacherIssues++;
        }
      }
      
      if (teacherIssues === 0) {
        console.log(`✅ ${teacher.name}: All students enrolled in all classes`);
      } else {
        console.log(`❌ ${teacher.name}: ${teacherIssues} student(s) missing enrollments`);
        totalIssues += teacherIssues;
      }
    }
    
    if (totalIssues === 0) {
      console.log('\n✨ ALL FIXED! All students are properly enrolled in all their teacher\'s classes!');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAllTeachers();
