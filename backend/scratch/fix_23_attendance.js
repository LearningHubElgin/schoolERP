const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'school_erp'
    });

    try {
        // Fetch school settings thresholds for school 1
        const [settings] = await db.query('SELECT min_hours_half_day, min_hours_full_day FROM schools WHERE id = 1');
        console.log('School settings:', settings[0]);
        const minHalf = parseFloat(settings[0]?.min_hours_half_day) || 2.4;
        const minFull = parseFloat(settings[0]?.min_hours_full_day) || 4.0;

        // Fetch records for 2026-07-23 and 2026-07-24
        const [records] = await db.query(
            `SELECT id, teacher_id, date, status, check_in_time, check_out_time 
             FROM teacher_attendance 
             WHERE date IN ('2026-07-23', '2026-07-24')`
        );
        console.log('Current records before recalculation:', records);

        for (const r of records) {
            if (r.check_in_time && r.check_out_time) {
                const [h1, m1] = r.check_in_time.split(':').map(Number);
                const [h2, m2] = r.check_out_time.split(':').map(Number);
                let diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
                if (diffMins < 0) diffMins += 1440;
                const hrs = diffMins / 60;

                let newStatus = 'Present';
                if (hrs >= minFull) newStatus = 'Present';
                else if (hrs >= minHalf) newStatus = 'Half Day';
                else newStatus = 'Present';

                console.log(`Record ID ${r.id} date ${r.date}: ${hrs.toFixed(2)} hrs -> newStatus: ${newStatus} (old: ${r.status})`);

                if (newStatus !== r.status) {
                    await db.query('UPDATE teacher_attendance SET status = ? WHERE id = ?', [newStatus, r.id]);
                    console.log(`Updated Record ID ${r.id} to ${newStatus}`);
                }
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

fix();
