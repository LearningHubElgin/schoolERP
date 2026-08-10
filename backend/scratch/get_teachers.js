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
        console.log('Fetching users with role = "teacher"...');
        const [users] = await db.query(
            'SELECT u.id, u.email, u.role, u.password, t.name FROM users u JOIN teachers t ON u.id = t.user_id LIMIT 10'
        );
        console.log(users);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

run();
