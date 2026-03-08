const db = require('../config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

/**
 * AUTO-ENROLLMENT UTILITY
 * Ensures all students are enrolled in all their teacher's classes
 */

// Enroll one student in all their teacher's classes
async function enrollStudentInTeacherClasses(studentId) {
  try {
    // Get student's teacher
    const studentResult = await query('SELECT teacher_id, name FROM users WHERE id = ? AND role = "student"', [studentId]);
    if (!studentResult || studentResult.length === 0) {
      console.log(`❌ Student ${studentId} not found`);
      return { success: false, message: 'Student not found' };
    }
    
    const student = studentResult[0];
    if (!student.teacher_id) {
      console.log(`⚠️  Student ${student.name} has no teacher assigned`);
      return { success: false, message: 'No teacher assigned' };
    }
    
    // Get all teacher's classes
    const classes = await query('SELECT id, title FROM classes WHERE teacher_id = ?', [student.teacher_id]);
    if (!classes || classes.length === 0) {
      console.log(`ℹ️  Teacher has no classes yet`);
      return { success: true, message: 'No classes to enroll in', enrolled: 0 };
    }
    
    let enrolled = 0;
    for (const cls of classes) {
      try {
        await query('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)', [cls.id, studentId]);
        console.log(`  ✅ ${student.name} → ${cls.title}`);
        enrolled++;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          // Already enrolled, skip
        } else {
          console.error(`  ❌ Error enrolling in ${cls.title}:`, err.message);
        }
      }
    }
    
    return { success: true, enrolled, total: classes.length };
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, message: error.message };
  }
}

// Enroll all students of a teacher in all that teacher's classes
async function enrollAllStudentsOfTeacher(teacherId) {
  try {
    const students = await query('SELECT id, name FROM users WHERE teacher_id = ? AND role = "student"', [teacherId]);
    if (!students || students.length === 0) {
      console.log(`ℹ️  Teacher ${teacherId} has no students`);
      return { success: true, message: 'No students to enroll', students: 0 };
    }
    
    let totalEnrolled = 0;
    for (const student of students) {
      const result = await enrollStudentInTeacherClasses(student.id);
      if (result.success && result.enrolled) {
        totalEnrolled += result.enrolled;
      }
    }
    
    return { success: true, students: students.length, totalEnrolled };
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, message: error.message };
  }
}

// Fix ALL students in the entire system
async function fixAllEnrollments() {
  try {
    console.log('🔧 AUTO-ENROLLMENT: FIXING ALL STUDENTS\n');
    
    const teachers = await query('SELECT id, name FROM users WHERE role = "teacher"');
    let totalFixed = 0;
    
    for (const teacher of teachers) {
      const students = await query('SELECT id, name FROM users WHERE teacher_id = ? AND role = "student"', [teacher.id]);
      if (!students || students.length === 0) continue;
      
      const classes = await query('SELECT id FROM classes WHERE teacher_id = ?', [teacher.id]);
      if (!classes || classes.length === 0) continue;
      
      console.log(`👨‍🏫 ${teacher.name}: ${students.length} student(s), ${classes.length} class(es)`);
      
      for (const student of students) {
        let enrolled = 0;
        for (const cls of classes) {
          try {
            await query('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)', [cls.id, student.id]);
            enrolled++;
          } catch (err) {
            // Ignore duplicates
          }
        }
        if (enrolled > 0) {
          console.log(`  ✅ ${student.name}: enrolled in ${enrolled} class(es)`);
          totalFixed += enrolled;
        }
      }
    }
    
    console.log(`\n✨ Total enrollments fixed: ${totalFixed}`);
    return { success: true, totalFixed };
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, message: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  (async () => {
    const result = await fixAllEnrollments();
    process.exit(result.success ? 0 : 1);
  })();
}

module.exports = {
  enrollStudentInTeacherClasses,
  enrollAllStudentsOfTeacher,
  fixAllEnrollments
};
