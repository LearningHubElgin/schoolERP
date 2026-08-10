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

        const [distribution] = await connection.query('SELECT gender, COUNT(*) as count FROM students GROUP BY gender');
        console.log('--- Gender Distribution ---');
        console.table(distribution);

        const [missing] = await connection.query(`
            SELECT id, student_name, roll_no, class, section, gender 
            FROM students 
            WHERE gender IS NULL 
               OR gender = '' 
               OR gender = 'None' 
               OR gender NOT IN ('Male', 'Female', 'Other', 'boy', 'girl')
        `);

        console.log('\n--- Students with Missing or Unexpected Gender ---');
        if (missing.length > 0) {
            console.table(missing);
        } else {
            console.log('No students found with missing gender.');
        }

        process.exit(0);
    } catch (e) {
        console.error('Error running query:', e);
        process.exit(1);
    }
}

run();
