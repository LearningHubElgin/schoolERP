const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'school_erp'
    });

    try {
        console.log('⏳ 1. Altering role enum in users table to include "superadmin"...');
        await connection.query(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM(
                'student',
                'teacher',
                'accountant',
                'admin',
                'admission',
                'librarian',
                'storemanager',
                'security',
                'driver',
                'nonteachingstaff',
                'superadmin'
            ) NOT NULL DEFAULT 'student'
        `);
        console.log('✅ Alteration successful.');

        console.log('⏳ 2. Checking if superadmin@school.erp already exists...');
        const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', ['superadmin@school.erp']);
        
        if (existing.length > 0) {
            console.log('ℹ️ Superadmin account already exists. Re-hashing password to "superadmin123"...');
            const hashedPassword = await bcrypt.hash('superadmin123', 10);
            await connection.query('UPDATE users SET password = ?, role = "superadmin" WHERE email = ?', [hashedPassword, 'superadmin@school.erp']);
            console.log('✅ Password re-hashed successfully!');
        } else {
            console.log('⏳ Creating new superadmin account...');
            const hashedPassword = await bcrypt.hash('superadmin123', 10);
            await connection.query(`
                INSERT INTO users (school_id, email, password, role, name, phone, status)
                VALUES (1, 'superadmin@school.erp', ?, 'superadmin', 'Super Admin', '9999999999', 'active')
            `, [hashedPassword]);
            console.log('✅ Superadmin account created successfully!');
        }
        
    } catch (err) {
        console.error('❌ Setup error:', err);
    } finally {
        await connection.end();
    }
}

run();
