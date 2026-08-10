const mysql = require('mysql2/promise');

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'school_erp'
    });

    try {
        const [rows] = await connection.query('DESCRIBE student_marks');
        console.log('student_marks table schema:');
        console.table(rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await connection.end();
    }
}

checkSchema();
