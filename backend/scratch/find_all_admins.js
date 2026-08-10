const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'school_erp'
    });

    try {
        const [rows] = await db.query('SELECT id, school_id, email, role, name FROM users WHERE school_id = 1 AND role = "admin"');
        console.log('ADMIN USERS FOR SCHOOL 1:', rows);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

run();
