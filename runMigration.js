const db = require('./backend/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Starting database migration...\n');

    // Read the SQL migration file
    const migrationFile = path.join(__dirname, 'backend', 'create_conversations_table.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    // Split SQL statements and filter empty ones
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing:`);
      console.log(statement.substring(0, 80) + (statement.length > 80 ? '...' : ''));

      try {
        const result = await new Promise((resolve, reject) => {
          db.query(statement, (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });

        console.log(`✓ Success\n`);
      } catch (error) {
        console.error(`✗ Error: ${error.message}\n`);
        // Continue with next statement even if this one fails (important for ALTER TABLE IF NOT EXISTS)
      }
    }

    console.log('Migration completed successfully!');
    db.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    db.end();
    process.exit(1);
  }
}

runMigration();
