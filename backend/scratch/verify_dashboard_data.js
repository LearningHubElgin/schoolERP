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
        const schoolId = 1;
        
        const getISTDate = () => {
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istDate = new Date(now.getTime() + istOffset);
            return istDate.toISOString().split('T')[0];
        };
        const today = getISTDate();

        const [totalStudentsRows] = await db.query('SELECT COUNT(*) as count FROM students s JOIN users u ON s.user_id = u.id WHERE s.school_id = ?', [schoolId]);
        const sTotal = totalStudentsRows[0].count;

        const [studentAttData] = await db.query(
            `SELECT 
                COALESCE(SUM(CASE WHEN (status IN ('present','Present')) THEN 1 ELSE 0 END), 0) as presentCount,
                COUNT(DISTINCT student_id) as markedCount
             FROM students_attendance 
             WHERE school_id = ? AND date = ?`,
            [schoolId, today]
        );
        
        console.log('--- Today Statistics ---');
        console.log('Today (IST):', today);
        console.log('Total Students:', sTotal);
        console.log('Present Count:', studentAttData[0].presentCount);
        console.log('Marked Count:', studentAttData[0].markedCount);

        const [weekData] = await db.query(
            `SELECT 
                sa.date,
                DATE_FORMAT(sa.date, '%a') as day_name,
                COALESCE(SUM(CASE WHEN sa.status IN ('present','Present') THEN 1 ELSE 0 END), 0) as student_present,
                COUNT(DISTINCT sa.student_id) as student_total
             FROM students_attendance sa
             WHERE sa.school_id = ? AND sa.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             GROUP BY sa.date
             ORDER BY sa.date ASC`,
            [schoolId]
        );
        
        console.log('\n--- Weekly Trend ---');
        console.log(weekData);

    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

check();
