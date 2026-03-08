const db = require('./config/db');

console.log('Checking foreign key constraints for classes table...\n');

const query = `
  SELECT 
    kcu.TABLE_NAME,
    kcu.COLUMN_NAME,
    kcu.CONSTRAINT_NAME,
    kcu.REFERENCED_TABLE_NAME,
    kcu.REFERENCED_COLUMN_NAME,
    rc.DELETE_RULE,
    rc.UPDATE_RULE
  FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
  JOIN
    INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
    ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME 
    AND kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
  WHERE 
    kcu.REFERENCED_TABLE_NAME = 'classes'
    AND kcu.TABLE_SCHEMA = 'alburhan_classroom'
  ORDER BY kcu.TABLE_NAME;
`;

db.query(query, (err, results) => {
  if (err) {
    console.error('❌ Error checking foreign keys:', err.message);
    process.exit(1);
  }

  console.log('📋 Foreign Key Constraints referencing classes table:\n');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
  
  if (results.length === 0) {
    console.log('⚠️  No foreign key constraints found referencing classes table');
  } else {
    results.forEach((fk, index) => {
      console.log(`${index + 1}. Table: ${fk.TABLE_NAME}`);
      console.log(`   Column: ${fk.COLUMN_NAME}`);
      console.log(`   Constraint: ${fk.CONSTRAINT_NAME}`);
      console.log(`   References: ${fk.REFERENCED_TABLE_NAME}(${fk.REFERENCED_COLUMN_NAME})`);
      console.log(`   ON DELETE: ${fk.DELETE_RULE}`);
      console.log(`   ON UPDATE: ${fk.UPDATE_RULE}`);
      console.log('───────────────────────────────────────────────────────────────────────────\n');
    });
    
    // Check if all have CASCADE or SET NULL on delete
    const missingCascade = results.filter(fk => 
      fk.DELETE_RULE !== 'CASCADE' && fk.DELETE_RULE !== 'SET NULL'
    );
    
    if (missingCascade.length === 0) {
      console.log('✅ All foreign keys have proper CASCADE DELETE or SET NULL configured!');
      console.log('✅ When a class is deleted, all related records will be automatically cleaned up.\n');
    } else {
      console.log('⚠️  Warning: Some foreign keys do not have CASCADE DELETE:\n');
      missingCascade.forEach(fk => {
        console.log(`   - ${fk.TABLE_NAME}.${fk.COLUMN_NAME}: ${fk.DELETE_RULE}`);
      });
    }
  }
  
  db.end();
  process.exit(0);
});
