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
        console.log('1. DESCRIPTIONS:');
        const [desc] = await db.query('DESCRIBE schools');
        console.log(desc);

        console.log('2. SHOW CREATE TABLE:');
        const [create] = await db.query('SHOW CREATE TABLE schools');
        console.log(create[0]['Create Table']);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

run();
