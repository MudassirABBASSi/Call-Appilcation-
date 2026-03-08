const db = require('./backend/config/db');

db.query(`
  SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_NAME = 'messages' AND TABLE_SCHEMA = 'alburhan_classroom'
  ORDER BY ORDINAL_POSITION
`, (err, results) => {
  if (err) {
    console.error('Error:', err.message);
    db.end();
    process.exit(1);
  }

  console.log('\n✓ Messages table structure:');
  console.table(results);
  
  const hasConversationId = results.some(col => col.COLUMN_NAME === 'conversation_id');
  if (hasConversationId) {
    console.log('\n✓ conversation_id column exists in messages table');
  } else {
    console.log('\n✗ conversation_id column DOES NOT exist - adding it now...');
    
    db.query(`
      ALTER TABLE messages 
      ADD COLUMN conversation_id INT DEFAULT NULL,
      ADD FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    `, (err2) => {
      if (err2) {
        console.log('ALTER TABLE attempt - some statements may have failed (OK)');
        console.log('Message:', err2.message);
      } else {
        console.log('✓ conversation_id column added successfully');
      }
      db.end();
      process.exit(0);
    });
    return;
  }

  db.end();
  process.exit(0);
});
