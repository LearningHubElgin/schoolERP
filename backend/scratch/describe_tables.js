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
        const [sDesc] = await db.query('DESCRIBE students_attendance');
        console.log('students_attendance schema:', sDesc);

        const [tDesc] = await db.query('DESCRIBE teacher_attendance');
        console.log('teacher_attendance schema:', tDesc);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

check();
