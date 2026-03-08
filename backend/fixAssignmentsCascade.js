const db = require('./config/db');

console.log('Fixing assignments table CASCADE DELETE constraint...\n');

// Step 1: Drop existing constraint
const dropQuery = 'ALTER TABLE assignments DROP FOREIGN KEY assignments_ibfk_1';

db.query(dropQuery, (err) => {
  if (err) {
    console.error('❌ Error dropping constraint:', err.message);
    if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.log('ℹ️  Constraint might not exist or have different name');
      console.log('Checking existing constraints...\n');
      
      // Check what constraints exist
      const checkQuery = `
        SELECT 
          CONSTRAINT_NAME,
          DELETE_RULE
        FROM 
          INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
        WHERE 
          CONSTRAINT_SCHEMA = 'alburhan_classroom'
          AND TABLE_NAME = 'assignments'
          AND REFERENCED_TABLE_NAME = 'classes'
      `;
      
      db.query(checkQuery, (err2, results) => {
        if (err2) {
          console.error('❌ Error checking constraints:', err2.message);
          db.end();
          process.exit(1);
        }
        
        console.log('Found constraints:', results);
        db.end();
        process.exit(1);
      });
      return;
    }
    db.end();
    process.exit(1);
  }
  
  console.log('✅ Dropped old constraint');
  
  // Step 2: Add new constraint with CASCADE DELETE
  const addQuery = `
    ALTER TABLE assignments 
    ADD CONSTRAINT assignments_ibfk_1 
    FOREIGN KEY (class_id) REFERENCES classes(id) 
    ON DELETE CASCADE 
    ON UPDATE NO ACTION
  `;
  
  db.query(addQuery, (err2) => {
    if (err2) {
      console.error('❌ Error adding new constraint:', err2.message);
      db.end();
      process.exit(1);
    }
    
    console.log('✅ Added new constraint with CASCADE DELETE');
    
    // Step 3: Verify the change
    const verifyQuery = `
      SELECT 
        CONSTRAINT_NAME,
        DELETE_RULE,
        UPDATE_RULE
      FROM 
        INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
      WHERE 
        CONSTRAINT_NAME = 'assignments_ibfk_1'
        AND CONSTRAINT_SCHEMA = 'alburhan_classroom'
    `;
    
    db.query(verifyQuery, (err3, results) => {
      if (err3) {
        console.error('❌ Error verifying constraint:', err3.message);
        db.end();
        process.exit(1);
      }
      
      console.log('\n📋 Verification:');
      console.log(results);
      
      if (results.length > 0 && results[0].DELETE_RULE === 'CASCADE') {
        console.log('\n✅ SUCCESS! assignments table now has CASCADE DELETE');
        console.log('✅ When a class is deleted, all related assignments will be automatically deleted');
      } else {
        console.log('\n⚠️  Warning: Constraint added but DELETE_RULE is not CASCADE');
      }
      
      db.end();
      process.exit(0);
    });
  });
});
