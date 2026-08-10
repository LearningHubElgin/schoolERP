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
        const [fees] = await db.query('SELECT COUNT(*) as count FROM fee_records');
        console.log('Total fee records:', fees[0].count);

        const [expenses] = await db.query('SELECT COUNT(*) as count FROM expenses');
        console.log('Total expense records:', expenses[0].count);

        if (fees[0].count > 0) {
            const [feeSample] = await db.query('SELECT payment_date, paid_amount FROM fee_records ORDER BY payment_date DESC LIMIT 5');
            console.log('Recent fee records:', feeSample);
        }

        if (expenses[0].count > 0) {
            const [expSample] = await db.query('SELECT expense_date, amount FROM expenses ORDER BY expense_date DESC LIMIT 5');
            console.log('Recent expense records:', expSample);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

check();
