const mysql = require('mysql2/promise');
require('dotenv').config();

async function testSummary() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_erp'
  });

  try {
    const [rows] = await db.query(
      `SELECT id, school_id, module_name, action, performed_by_name, performed_by_role, status, created_at 
       FROM activity_logs 
       WHERE school_id = 1 AND (performed_by_role IS NOT NULL AND LOWER(performed_by_role) != 'superadmin')`
    );
    console.log(`✅ School #1 activity logs count:`, rows.length);
    console.log('Sample rows:', rows.slice(0, 5));
  } catch (err) {
    console.error(err);
  } finally {
    await db.end();
  }
}

testSummary();
