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
    const [res] = await db.query(
      `DELETE FROM activity_logs WHERE (changed_fields IS NULL OR changed_fields = '[]') AND old_value IS NOT NULL AND old_value = new_value`
    );
    console.log(`✅ Removed ${res.affectedRows} unchanged update log entries.`);
  } catch (err) {
    console.error(err);
  } finally {
    await db.end();
  }
}

cleanup();
