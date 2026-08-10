const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanup() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_erp'
  });

  try {
    // Delete legacy seed/null user logs from activity_logs where performed_by_name IS NULL
    const [res] = await db.query(
      `DELETE FROM activity_logs WHERE performed_by_name IS NULL OR performed_by_name = '' OR LOWER(performed_by_role) = 'superadmin'`
    );
    console.log(`✅ Cleaned up ${res.affectedRows} legacy seed/superadmin logs from activity_logs.`);
  } catch (err) {
    console.error('Cleanup error:', err);
  } finally {
    await db.end();
  }
}

cleanup();
