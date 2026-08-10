const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function testLogin() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_erp'
  });

  try {
    const loginId = 'admin@gmail.com';
    const password = 'admin123';

    const [users] = await db.query(
      `SELECT u.*, s.name as school_name 
       FROM users u 
       LEFT JOIN schools s ON u.school_id = s.id 
       WHERE u.email = ? OR u.phone = ? OR u.id = ? OR u.student_unique_id = ?`,
      [loginId, loginId, loginId, loginId]
    );

    console.log(`Query returned ${users.length} user(s):`, users[0] ? { id: users[0].id, email: users[0].email, role: users[0].role, status: users[0].status, school_id: users[0].school_id } : 'None');

    if (users.length > 0) {
      const match = await bcrypt.compare(password, users[0].password) || (password === users[0].password);
      console.log('Password match:', match);
    }
  } catch (err) {
    console.error('Test login error:', err);
  } finally {
    await db.end();
  }
}

testLogin();
