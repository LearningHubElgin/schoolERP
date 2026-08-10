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
        const [rows] = await db.query('SELECT id, school_id, email, role, name FROM users WHERE email = "admin@school.edu"');
        console.log('RESULTS FOR admin@school.edu:', rows);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

run();
