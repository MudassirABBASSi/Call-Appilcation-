const db = require('./config/db');
const bcrypt = require('bcryptjs');

let createdCount = {
  users: 0,
  classes: 0,
  enrollments: 0,
  assignments: 0
};

const createUser = (name, email, password, role, teacher_id = null) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return reject(err);
      bcrypt.hash(password, salt, (err, hashedPassword) => {
        if (err) return reject(err);
        
        const query = 'INSERT INTO users (name, email, password, role, teacher_id) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [name, email, hashedPassword, role, teacher_id], (err, result) => {
          if (err) {
            // User might already exist, try to find them
            db.query('SELECT id FROM users WHERE email = ?', [email], (findErr, rows) => {
              if (rows && rows.length > 0) {
                resolve(rows[0].id);
              } else {
                reject(err);
              }
            });
          } else {
            createdCount.users++;
            resolve(result.insertId);
          }
        });
      });
    });
  });
};

const createClass = (title, teacher_id) => {
  return new Promise((resolve, reject) => {
    const roomId = `demo-room-${Date.now()}`;
    const date = new Date();
    date.setHours(date.getHours() + 24);
    
    // Format as MySQL datetime: YYYY-MM-DD HH:MM:SS
    const dateStr = date.getFullYear() + '-' + 
                   String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(date.getDate()).padStart(2, '0') + ' ' +
                   String(date.getHours()).padStart(2, '0') + ':' +
                   String(date.getMinutes()).padStart(2, '0') + ':' +
                   String(date.getSeconds()).padStart(2, '0');
    
    const query = 'INSERT INTO classes (title, description, date, roomId, teacher_id) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [title, `${title} - Demo Class`, dateStr, roomId, teacher_id], (err, result) => {
      if (err) reject(err);
      else {
        createdCount.classes++;
        resolve(result.insertId);
      }
    });
  });
};

const enrollStudent = (class_id, student_id) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO class_students (class_id, student_id) VALUES (?, ?)';
    db.query(query, [class_id, student_id], (err, result) => {
      if (err) {
        // Might already exist, just resolve
        resolve();
      } else {
        createdCount.enrollments++;
        resolve();
      }
    });
  });
};

const createAssignment = (title, class_id, teacher_id) => {
  return new Promise((resolve, reject) => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    
    // Format as MySQL datetime: YYYY-MM-DD HH:MM:SS
    const deadlineStr = deadline.getFullYear() + '-' + 
                       String(deadline.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(deadline.getDate()).padStart(2, '0') + ' ' +
                       String(deadline.getHours()).padStart(2, '0') + ':' +
                       String(deadline.getMinutes()).padStart(2, '0') + ':' +
                       String(deadline.getSeconds()).padStart(2, '0');
    
    const query = 'INSERT INTO assignments (title, description, class_id, teacher_id, total_marks, deadline) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [title, `${title} - Demo Assignment`, class_id, teacher_id, 100, deadlineStr], (err, result) => {
      if (err) reject(err);
      else {
        createdCount.assignments++;
        resolve(result.insertId);
      }
    });
  });
};

(async () => {
  try {
    console.log('\n📋 Creating Demo Data...\n');
    
    // Step 1: Create Admin
    console.log('👤 Creating Admin...');
    const adminId = await createUser('Admin User', 'mudassirabbassi786@gmail.com', 'Abbassi786', 'admin');
    console.log(`   ✅ Admin created (ID: ${adminId}) - Email: mudassirabbassi786@gmail.com | Pass: Abbassi786`);
    
    // Step 2: Create Teachers
    console.log('\n👨‍🏫 Creating Teachers...');
    const teacher1Id = await createUser('Mr. Ahmed', 'ahmed@demo.com', 'teacher123', 'teacher');
    console.log(`   ✅ Teacher 1 created (ID: ${teacher1Id}) - Email: ahmed@demo.com | Pass: teacher123`);
    
    const teacher2Id = await createUser('Ms. Fatima', 'fatima@demo.com', 'teacher123', 'teacher');
    console.log(`   ✅ Teacher 2 created (ID: ${teacher2Id}) - Email: fatima@demo.com | Pass: teacher123`);
    
    // Step 3: Create Students with teacher assignment
    console.log('\n👨‍🎓 Creating Students...');
    const student1Id = await createUser('Ali Hassan', 'ali@demo.com', 'student123', 'student', teacher1Id);
    console.log(`   ✅ Student 1 created (ID: ${student1Id}) - Email: ali@demo.com | Pass: student123`);
    
    const student2Id = await createUser('Zainab Khan', 'zainab@demo.com', 'student123', 'student', teacher1Id);
    console.log(`   ✅ Student 2 created (ID: ${student2Id}) - Email: zainab@demo.com | Pass: student123`);
    
    const student3Id = await createUser('Omar Ibrahim', 'omar@demo.com', 'student123', 'student', teacher2Id);
    console.log(`   ✅ Student 3 created (ID: ${student3Id}) - Email: omar@demo.com | Pass: student123`);
    
    const student4Id = await createUser('Hana Malik', 'hana@demo.com', 'student123', 'student', teacher2Id);
    console.log(`   ✅ Student 4 created (ID: ${student4Id}) - Email: hana@demo.com | Pass: student123`);
    
    const student5Id = await createUser('Sara Ali', 'sara@demo.com', 'student123', 'student', teacher1Id);
    console.log(`   ✅ Student 5 created (ID: ${student5Id}) - Email: sara@demo.com | Pass: student123`);
    
    // Step 4: Create Classes
    console.log('\n📚 Creating Classes...');
    const class1Id = await createClass('Mathematics 101', teacher1Id);
    console.log(`   ✅ Class 1 created (ID: ${class1Id}) - Mathematics 101 (Teacher: Ahmed)`);
    
    const class2Id = await createClass('Chemistry 201', teacher1Id);
    console.log(`   ✅ Class 2 created (ID: ${class2Id}) - Chemistry 201 (Teacher: Ahmed)`);
    
    const class3Id = await createClass('English 101', teacher2Id);
    console.log(`   ✅ Class 3 created (ID: ${class3Id}) - English 101 (Teacher: Fatima)`);
    
    // Step 5: Enroll Students in Classes
    console.log('\n🔗 Enrolling Students in Classes...');
    // Math class: Ali, Zainab, Sara
    await enrollStudent(class1Id, student1Id);
    await enrollStudent(class1Id, student2Id);
    await enrollStudent(class1Id, student5Id);
    console.log(`   ✅ Ali, Zainab, Sara enrolled in Mathematics 101`);
    
    // Chemistry class: Zainab, Sara
    await enrollStudent(class2Id, student2Id);
    await enrollStudent(class2Id, student5Id);
    console.log(`   ✅ Zainab, Sara enrolled in Chemistry 201`);
    
    // English class: Omar, Hana
    await enrollStudent(class3Id, student3Id);
    await enrollStudent(class3Id, student4Id);
    console.log(`   ✅ Omar, Hana enrolled in English 101`);
    
    // Step 6: Create Assignments
    console.log('\n📝 Creating Assignments...');
    const assign1 = await createAssignment('Algebra Problems', class1Id, teacher1Id);
    console.log(`   ✅ Assignment 1 created - "Algebra Problems" in Mathematics 101`);
    
    const assign2 = await createAssignment('Chemical Reactions', class2Id, teacher1Id);
    console.log(`   ✅ Assignment 2 created - "Chemical Reactions" in Chemistry 201`);
    
    const assign3 = await createAssignment('Essay Writing', class3Id, teacher2Id);
    console.log(`   ✅ Assignment 3 created - "Essay Writing" in English 101`);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ DEMO DATA CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`
📊 Summary:
   • Users Created: ${createdCount.users} (1 Admin, 2 Teachers, 5 Students)
   • Classes Created: ${createdCount.classes}
   • Student Enrollments: ${createdCount.enrollments}
   • Assignments Created: ${createdCount.assignments}

🔐 Demo Accounts (use these to login):

ADMIN:
   Email: admin@demo.com
   Password: admin123

TEACHERS:
   Email: ahmed@demo.com         | Password: teacher123
   Email: fatima@demo.com        | Password: teacher123

STUDENTS:
   Email: ali@demo.com           | Password: student123
   Email: zainab@demo.com        | Password: student123
   Email: omar@demo.com          | Password: student123
   Email: hana@demo.com          | Password: student123
   Email: sara@demo.com          | Password: student123

📚 Class Structure:
   • Mathematics 101 (Ahmed) → Ali, Zainab, Sara
   • Chemistry 201 (Ahmed) → Zainab, Sara
   • English 101 (Fatima) → Omar, Hana

📝 Assignments Created:
   1. "Algebra Problems" in Math 101 (due in 7 days)
   2. "Chemical Reactions" in Chemistry 201 (due in 7 days)
   3. "Essay Writing" in English 101 (due in 7 days)

🧪 Testing Steps:
   1. Login as Ahmed (teacher)
   2. Go to Manage Assignments
   3. Click "Create Assignment"
   4. Select student from dropdown (e.g., Ali)
   5. Class will show only his classes
   6. Create assignment for that class
   7. Ali will see it in student dashboard
    `);
    
    console.log('='.repeat(60) + '\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    process.exit(1);
  }
})();
