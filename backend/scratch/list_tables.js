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
        const [tables] = await db.query('SHOW TABLES');
        console.log('Tables in database:', tables);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

check();
