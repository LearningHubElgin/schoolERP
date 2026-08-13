const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'school_erp',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Test Sequelize connection
sequelize.authenticate()
    .then(() => {
        console.log('✅ Sequelize ORM connected to MySQL database successfully.');
    })
    .catch(err => {
        console.error('❌ Sequelize connection error:', err.message);
    });

// Connection pool for legacy raw SQL compatibility
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
