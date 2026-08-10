const { logUpdate } = require('../utils/activityLogger');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testTeacherUpdateSchool3() {
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
      originalUrl: '/api/admin/teachers/5',
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      user: { id: 25, name: 'School 3 Admin', role: 'admin', school_id: 3 }
    };

    const oldData = {
      name: 'Ramesh Sen',
      subject: 'Mathematics',
      phone: '9876543210'
    };

    const newData = {
      name: 'Ramesh Kumar Sen',
      subject: 'Higher Mathematics',
      phone: '9876543210'
    };

    await logUpdate({
      schoolId: 3,
      moduleName: 'Teachers',
      entityType: 'Teacher',
      entityId: '5',
      entityName: 'Ramesh Kumar Sen',
      oldData,
      newData,
      description: 'Updated teacher name from Ramesh Sen to Ramesh Kumar Sen',
      user: fakeReq.user,
      req: fakeReq
    });

    console.log('✅ Simulated Teacher Update for School ID 3.');

    await new Promise(r => setTimeout(r, 500));

    const [rows] = await db.query('SELECT * FROM activity_logs WHERE school_id = 3 ORDER BY id DESC LIMIT 1');
    console.log('Inserted log row for School 3:', rows[0]);

  } catch (err) {
    console.error(err);
  } finally {
    await db.end();
  }
}

testTeacherUpdateSchool3();
