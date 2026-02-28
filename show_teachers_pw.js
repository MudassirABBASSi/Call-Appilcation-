const db = require('./backend/config/db');

db.query("SELECT id,email,password FROM users WHERE role='teacher'", (err, results) => {
  if (err) { console.error(err); process.exit(1); }
  console.log(results);
  process.exit(0);
});