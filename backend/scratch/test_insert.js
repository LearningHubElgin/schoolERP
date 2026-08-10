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
        const studentId = 1; // standard mock student ID
        const date = '2026-05-06';
        const effectiveSubject = 'day_wise';
        const status = 'present';
        const userId = 1;
        const remarks = null;
        const schoolId = 1;

        const values = [
            [studentId, date, effectiveSubject, status, userId, remarks, schoolId]
        ];

        console.log('Inserting/updating test attendance record...');
        const result = await db.query(
            `INSERT INTO students_attendance (student_id, date, subject, status, marked_by, remarks, school_id)
             VALUES ?
             ON DUPLICATE KEY UPDATE 
                 status = VALUES(status), 
                 remarks = VALUES(remarks),
                 marked_by = VALUES(marked_by),
                 updated_at = CURRENT_TIMESTAMP`,
            [values]
        );
        console.log('Result:', result);
    } catch (err) {
        console.error('SQL Error occurred:', err);
    } finally {
        await db.end();
    }
}

run();
