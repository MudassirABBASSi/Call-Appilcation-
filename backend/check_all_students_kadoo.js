const db = require('./config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

async function diagnoseTeacher() {
  try {
    console.log('🔍 CHECKING ALL STUDENTS FOR TEACHER KADOO\n');
    
    // Get teacher Kadoo
    const teacherResult = await query('SELECT id, name FROM users WHERE name LIKE "%Kadoo%"');
    if (!teacherResult || teacherResult.length === 0) {
      console.log('❌ Teacher Kadoo not found');
      process.exit(1);
    }
    
    const teacher = teacherResult[0];
    console.log(`✅ Teacher: ${teacher.name} (ID: ${teacher.id})\n`);
    
    // Get all classes by Kadoo
    console.log('📚 CLASSES CREATED BY KADOO:');
    const classes = await query('SELECT id, title FROM classes WHERE teacher_id = ?', [teacher.id]);
    console.table(classes);
    
    // Get all students assigned to Kadoo (via student.teacher_id)
    console.log('\n👥 STUDENTS ASSIGNED TO KADOO (via teacher_id field):');
    const assignedStudents = await query('SELECT id, name FROM users WHERE role = "student" AND teacher_id = ?', [teacher.id]);
    console.table(assignedStudents);
    
    if (!assignedStudents || assignedStudents.length === 0) {
      console.log('❌ No students assigned to Kadoo');
      process.exit(1);
    }
    
    // Check enrollment for each student
    console.log('\n📝 CHECKING ENROLLMENTS:\n');
    
    let missingEnrollments = [];
    
    for (const student of assignedStudents) {
      console.log(`Student: ${student.name} (ID: ${student.id})`);
      
      // Check which classes this student is enrolled in
      const enrollments = await query(`
        SELECT cs.class_id, c.title 
        FROM class_students cs
        JOIN classes c ON cs.class_id = c.id
        WHERE cs.student_id = ?
      `, [student.id]);
      
      if (!enrollments || enrollments.length === 0) {
        console.log(`   ❌ NOT ENROLLED IN ANY CLASS`);
        // This student should be in all Kadoo's classes
        for (const cls of classes) {
          missingEnrollments.push({
            student_id: student.id,
            student_name: student.name,
            class_id: cls.id,
            class_name: cls.title
          });
        }
      } else {
        console.log(`   ✅ Enrolled in: ${enrollments.map(e => e.title).join(', ')}`);
        
        // Check if missing any Kadoo classes
        const enrolledClassIds = enrollments.map(e => e.class_id);
        for (const cls of classes) {
          if (!enrolledClassIds.includes(cls.id)) {
            console.log(`      ⚠️  Missing: ${cls.title}`);
            missingEnrollments.push({
              student_id: student.id,
              student_name: student.name,
              class_id: cls.id,
              class_name: cls.title
            });
          }
        }
      }
      console.log('');
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    if (missingEnrollments.length === 0) {
      console.log('✨ All students correctly enrolled in all classes!');
      process.exit(0);
    } else {
      console.log(`🔴 FOUND ${missingEnrollments.length} MISSING ENROLLMENTS:\n`);
      console.table(missingEnrollments);
      
      console.log('\n⏳ Would you like me to auto-enroll all these students? (Y/N)');
      console.log('\nI can automatically add all missing enrollments...');
      
      // Save for next step
      global.missingEnrollments = missingEnrollments;
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

diagnoseTeacher();
