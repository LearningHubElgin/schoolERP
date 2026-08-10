const fs = require('fs');
const db = require('../config/database');

async function runMigration() {
    try {
        console.log('Running ENUM migration...');
        await db.query(`ALTER TABLE users MODIFY COLUMN role ENUM('student', 'teacher', 'accountant', 'admin', 'admission', 'librarian', 'storemanager', 'security', 'driver', 'staff', 'nonteachingstaff')`);
        
        // Update any existing staff to nonteachingstaff
        await db.query(`UPDATE users SET role = 'nonteachingstaff' WHERE role = 'staff'`);
        
        // Finalize enum to remove staff
        await db.query(`ALTER TABLE users MODIFY COLUMN role ENUM('student', 'teacher', 'accountant', 'admin', 'admission', 'librarian', 'storemanager', 'security', 'driver', 'nonteachingstaff') DEFAULT 'student'`);
        
        console.log('Migration successful: role updated to nonteachingstaff');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

runMigration();
