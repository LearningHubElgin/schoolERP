const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'school_erp'
    });

    try {
        console.log('Migrating student_marks table...');
        await connection.query('ALTER TABLE student_marks ADD COLUMN IF NOT EXISTS custom_marks JSON DEFAULT NULL AFTER grade');
        console.log('✅ Migration successful: Added custom_marks column');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
    }
}

migrate();
