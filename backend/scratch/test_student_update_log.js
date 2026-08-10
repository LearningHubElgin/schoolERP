const { logUpdate } = require('../utils/activityLogger');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testStudentUpdate() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_erp'
  });

  try {
    const fakeReq = {
      ip: '127.0.0.1',
      method: 'PUT',
      originalUrl: '/api/admin/students/101',
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      user: { id: 10, name: 'Admin User', role: 'admin', school_id: 1 }
    };

    const oldData = {
      student_name: 'Rahul Kumar',
      class: 'VII',
      section: 'A',
      phone: '9999999999'
    };

    const newData = {
      student_name: 'Rahul Sharma',
      class: 'VIII',
      section: 'B',
      phone: '8888888888'
    };

    await logUpdate({
      schoolId: 1,
      moduleName: 'Students',
      entityType: 'Student',
      entityId: '101',
      entityName: 'Rahul Sharma',
      oldData,
      newData,
      description: 'Updated student name from Rahul Kumar to Rahul Sharma',
      user: fakeReq.user,
      req: fakeReq
    });

    console.log('✅ Simulated student update audit log sent.');

    // Wait 500ms and check DB
    await new Promise(r => setTimeout(r, 500));

    const [rows] = await db.query('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 1');
    console.log('Inserted log row:', rows[0]);

  } catch (err) {
    console.error(err);
  } finally {
    await db.end();
  }
}

testStudentUpdate();
