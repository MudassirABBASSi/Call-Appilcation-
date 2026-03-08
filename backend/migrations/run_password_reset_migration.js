const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Run password reset migration
const migrationFile = path.join(__dirname, 'add_password_reset_tokens.sql');
const sql = fs.readFileSync(migrationFile, 'utf8');

// Split by semicolons and filter out empty statements
const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

console.log('Running password reset migration...');

// Execute each statement
let completed = 0;
statements.forEach((statement, index) => {
  db.query(statement, (err, result) => {
    if (err) {
      console.error(`Error executing statement ${index + 1}:`, err.message);
    } else {
      console.log(`✓ Statement ${index + 1} executed successfully`);
    }
    
    completed++;
    if (completed === statements.length) {
      console.log('\n✓ Password reset migration completed!');
      process.exit(0);
    }
  });
});
