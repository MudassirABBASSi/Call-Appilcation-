const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'abbassi32304',
  database: 'alburhan_classroom',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function resetTeacherPassword() {
  try {
    const conn = await pool.getConnection();
    
    // Find the teacher
    const [users] = await conn.query(
      'SELECT id, name, email, role FROM users WHERE email = ? OR name = ?',
      ['mudassirabbassi0000@gmail.com', 'mudassirabbassi']
    );
    
    if (users.length === 0) {
      console.log('❌ Teacher not found');
      conn.release();
      await pool.end();
      return;
    }
    
    const user = users[0];
    console.log('✓ Teacher Found:', user);
    
    // Set new password as "123456"
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const [result] = await conn.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    console.log('✓ Password updated successfully');
    console.log(`\n📧 Email: ${user.email}`);
    console.log(`🔐 New Password: ${newPassword}`);
    console.log('⚠️  Please change this password after first login for security');
    
    conn.release();
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetTeacherPassword();
