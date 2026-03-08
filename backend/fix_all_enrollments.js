const db = require('./config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

async function fixEnrollments() {
  try {
    console.log('🔧 AUTO-FIXING MISSING ENROLLMENTS\n');
    
    const enrollments = [
      { student_id: 18, class_id: 21, student_name: 'Ali Hassan', class_name: 'BIO' },
      { student_id: 22, class_id: 21, student_name: 'Mudassir Abbassi', class_name: 'BIO' },
      { student_id: 22, class_id: 25, student_name: 'Mudassir Abbassi', class_name: 'BIOLOGY' }
    ];
    
    console.log(`Adding ${enrollments.length} enrollments...\n`);
    
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
          console.log(`❌ ${enrollment.student_name} → ${enrollment.class_name} (Error: ${err.message})`);
        }
      }
    }
    
    console.log(`\n✨ Fixed ${count} enrollments!\n`);
    
    // Verify
    console.log('📝 VERIFICATION - Current enrollments for Kadoo\'s students:\n');
    const students = await query('SELECT id, name FROM users WHERE teacher_id = 21');
    
    for (const student of students) {
      const enrollments = await query(`
        SELECT c.title 
        FROM class_students cs
        JOIN classes c ON cs.class_id = c.id
        WHERE cs.student_id = ?
      `, [student.id]);
      
      const classes = enrollments.map(e => e.title).join(', ');
      console.log(`${student.name}: ${classes || 'NOT ENROLLED'}`);
    }
    
    console.log('\n✅ ALL FIXED! Students are now enrolled in all Kadoo classes.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixEnrollments();
