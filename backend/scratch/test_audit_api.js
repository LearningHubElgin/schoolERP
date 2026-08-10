const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_erp'
  });

  try {
    const [rows] = await db.query('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 5');
    console.log('✅ Activity logs count in DB:', rows.length);
    console.log('Sample audit log row:', rows[0]);
  } catch (err) {
    console.error('Test query error:', err);
  } finally {
    await db.end();
  }
}

check();
