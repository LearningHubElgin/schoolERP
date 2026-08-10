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
        const [records] = await db.query(
            `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, status, check_in_time, check_out_time 
             FROM teacher_attendance 
             WHERE DATE_FORMAT(date, '%Y-%m') = '2026-07'`
        );
        console.log('Teacher attendance monthly records:', records);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

check();
