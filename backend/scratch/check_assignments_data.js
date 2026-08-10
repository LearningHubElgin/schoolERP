const mysql = require('mysql2/promise');

async function checkAssignments() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'school_erp'
    });

    try {
        const [rows] = await connection.query('SELECT class, section FROM marks_assignments LIMIT 5');
        console.log('Marks Assignments Sample:');
        console.table(rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await connection.end();
    }
}

checkAssignments();
