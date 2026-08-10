const db = require('../config/database');

async function updateAdmissionUsers() {
    try {
        console.log('=== Updating Admission Users with School ID ===\n');

        // Check current state
        const [users] = await db.query(
            'SELECT id, email, name, role, school_id FROM users WHERE role = "admission"'
        );

        console.log('Current Admission Users:');
        users.forEach(u => {
            console.log(`ID: ${u.id}, Email: ${u.email}, School ID: ${u.school_id}`);
        });

        // Update admission users to school_id = 1 if they have NULL
        const [result] = await db.query(
            'UPDATE users SET school_id = 1 WHERE role = "admission" AND school_id IS NULL'
        );

        console.log(`\nUpdated ${result.affectedRows} admission users to school_id = 1`);

        // Check updated state
        const [updatedUsers] = await db.query(
            'SELECT id, email, name, role, school_id FROM users WHERE role = "admission"'
        );

        console.log('\nUpdated Admission Users:');
        updatedUsers.forEach(u => {
            console.log(`ID: ${u.id}, Email: ${u.email}, School ID: ${u.school_id}`);
        });

        // Also update existing applications to school_id = 1 if NULL
        const [appResult] = await db.query(
            'UPDATE student_applications SET school_id = 1 WHERE school_id IS NULL'
        );

        console.log(`\nUpdated ${appResult.affectedRows} applications to school_id = 1`);

        console.log('\n✅ All done! Please logout and login again as admission user.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateAdmissionUsers();
