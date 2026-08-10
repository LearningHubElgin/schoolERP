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
        const getISTDate = () => {
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istDate = new Date(now.getTime() + istOffset);
            return istDate.toISOString().split('T')[0];
        };
        const today = getISTDate();
        console.log('Calculated IST Today:', today);

        // Check if records for April 13th (last marked day) are found correctly
        // At 10:46 AM on the 14th, today is the 14th.
        // My previous script showed no records for the 14th.
        
        const [lastS] = await db.query('SELECT date, COUNT(*) as count FROM students_attendance GROUP BY date ORDER BY date DESC LIMIT 1');
        if (lastS[0]) {
            const rawDate = lastS[0].date;
            console.log('Last marked date in DB (Raw):', rawDate);
            
            const formatDate = (dateVal) => {
                if (!(dateVal instanceof Date)) return dateVal;
                const d = new Date(dateVal.getTime() + (5.5 * 60 * 60 * 1000));
                return d.toISOString().split('T')[0];
            };
            console.log('Last marked date (Formatted):', formatDate(rawDate));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

check();
