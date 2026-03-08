const db = require('./config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

async function diagnose() {
  console.log('🔍 DIAGNOSTIC: Teacher Kadoo + Student Ali Hassan\n');
  
  try {
    // Step 1: Find teacher Kadoo
    console.log('1️⃣  Looking for teacher "Kadoo"...');
    const teacherResult = await query('SELECT id, name, email FROM users WHERE name LIKE "%Kadoo%" OR name LIKE "%kadoo%"');
    
    if (!teacherResult || teacherResult.length === 0) {
      console.log('   ❌ Teacher "Kadoo" NOT found');
      console.log('\n   Available teachers:');
      const teachers = await query('SELECT id, name, email FROM users WHERE role = "teacher"');
      console.table(teachers);
      process.exit(1);
    }
    
    const teacher = teacherResult[0];
    console.log('   ✅ Found:', teacher.name, `(ID: ${teacher.id})`);
    
    // Step 2: Find Biology class by this teacher
    console.log('\n2️⃣  Looking for BIOLOGY class by teacher Kadoo...');
    const classResult = await query('SELECT id, title, teacher_id FROM classes WHERE teacher_id = ? AND (title LIKE "%BIOLOGY%" OR title LIKE "%Biology%")', [teacher.id]);
    
    if (!classResult || classResult.length === 0) {
      console.log('   ❌ BIOLOGY class NOT found for teacher Kadoo');
      console.log('\n   All classes created by Kadoo:');
      const allClasses = await query('SELECT id, title FROM classes WHERE teacher_id = ?', [teacher.id]);
      if (allClasses && allClasses.length > 0) {
        console.table(allClasses);
      } else {
        console.log('   No classes found');
      }
      process.exit(1);
    }
    
    const bioClass = classResult[0];
    console.log('   ✅ Found:', bioClass.title, `(ID: ${bioClass.id})`);
    
    // Step 3: Find student Ali Hassan
    console.log('\n3️⃣  Looking for student "Ali Hassan"...');
    const studentResult = await query('SELECT id, name, email FROM users WHERE name LIKE "%Ali%" AND name LIKE "%Hassan%"');
    
    if (!studentResult || studentResult.length === 0) {
      console.log('   ❌ Student "Ali Hassan" NOT found');
      console.log('\n   Available students:');
      const students = await query('SELECT id, name, email FROM users WHERE role = "student"');
      console.table(students);
      process.exit(1);
    }
    
    const student = studentResult[0];
    console.log('   ✅ Found:', student.name, `(ID: ${student.id})`);
    
    // Step 4: Check if Ali is enrolled in BIOLOGY class
    console.log('\n4️⃣  Checking if Ali Hassan is enrolled in BIOLOGY class...');
    const enrollmentResult = await query('SELECT * FROM class_students WHERE student_id = ? AND class_id = ?', [student.id, bioClass.id]);
    
    if (!enrollmentResult || enrollmentResult.length === 0) {
      console.log('   ❌ Ali Hassan is NOT enrolled in BIOLOGY class');
      console.log('\n   🔴 THIS IS THE PROBLEM!');
      console.log(`   Ali Hassan (ID ${student.id}) is not in class_students table`);
      console.log(`   for BIOLOGY class (ID ${bioClass.id})`);
      
      console.log('\n5️⃣  Checking what classes Ali is enrolled in...');
      const aliEnrollments = await query(`
        SELECT cs.class_id, c.title, c.teacher_id 
        FROM class_students cs 
        JOIN classes c ON cs.class_id = c.id 
        WHERE cs.student_id = ?
      `, [student.id]);
      
      if (aliEnrollments && aliEnrollments.length > 0) {
        console.log('   Ali is enrolled in these classes:');
        console.table(aliEnrollments);
      } else {
        console.log('   Ali is not enrolled in ANY class!');
      }
      
      process.exit(1);
    }
    
    console.log('   ✅ YES - Ali Hassan IS enrolled in BIOLOGY');
    console.table(enrollmentResult);
    
    console.log('\n✨ Everything looks correct! No problems found.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

diagnose();
