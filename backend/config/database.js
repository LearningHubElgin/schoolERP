const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection()
    .then(connection => {
        const cluster = require('cluster');
        if (cluster.isPrimary || (cluster.isWorker && cluster.worker.id === 1)) {
            console.log('✅ Database connected successfully');
        }
        connection.release();
    })
    .catch(err => {
        const cluster = require('cluster');
        if (cluster.isPrimary || (cluster.isWorker && cluster.worker.id === 1)) {
            console.error('❌ Database connection failed:', err.message);
        }
    });

module.exports = pool;
