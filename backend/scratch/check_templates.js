const mysql = require('mysql2/promise');

async function checkTemplates() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'school_erp'
    });

    try {
        const [rows] = await connection.query('SELECT id, name, is_default, assigned_class FROM marksheet_templates');
        console.log('Marksheet Templates:');
        console.table(rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await connection.end();
    }
}

checkTemplates();
