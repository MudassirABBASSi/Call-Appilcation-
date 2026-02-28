const db = require('./backend/config/db');

db.query("SELECT id,name,email,role FROM users WHERE role='teacher'", (err, results) => {
  if (err) {
    console.error('DB error', err);
    process.exit(1);
  }
  console.log('teachers:', results);
  process.exit(0);
});