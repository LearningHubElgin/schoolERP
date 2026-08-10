const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function createTable() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'school_erp'
        });

        const query = `
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                school_id INT,
                user_id INT,
                user_name VARCHAR(100),
                user_email VARCHAR(100),
                user_role VARCHAR(50),
                action VARCHAR(50) NOT NULL,
                details TEXT,
                ip_address VARCHAR(50),
                user_agent VARCHAR(255),
                status VARCHAR(20) DEFAULT 'Success',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (school_id),
                INDEX (user_id),
                INDEX (action),
                INDEX (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.query(query);
        console.log('activity_logs table created successfully.');
        await connection.end();
    } catch (error) {
        console.error('Error creating table:', error);
    }
}

createTable();
