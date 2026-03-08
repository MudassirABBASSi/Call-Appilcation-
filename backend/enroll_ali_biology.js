const db = require('./config/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

async function enrollment() {
  try {
    console.log('📝 Adding Ali Hassan to BIOLOGY class...\n');
    
    const result = await query(
      'INSERT INTO class_students (class_id, student_id) VALUES (?, ?)',
      [25, 18]  // BIOLOGY class ID 25, Ali Hassan ID 18
    );
    
    console.log('✅ SUCCESS!');
    console.log('   Ali Hassan (ID: 18) has been enrolled in BIOLOGY (ID: 25)');
    
    // Verify
    console.log('\n✓ Verifying enrollment...');
    const verify = await query(
      'SELECT * FROM class_students WHERE student_id = 18 AND class_id = 25'
    );
    console.table(verify);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

enrollment();
