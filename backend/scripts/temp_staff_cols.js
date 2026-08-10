const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'school_erp'
        });
        const [cols] = await connection.query(`DESCRIBE non_teaching_staff`);
        console.log(cols.map(c => c.Field).join(', '));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
