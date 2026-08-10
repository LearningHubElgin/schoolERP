const db = require('../config/database');

async function findOrphaned() {
    try {
        // All users with role nonteachingstaff
        const [allUsers] = await db.query(
            "SELECT id, name, email, phone, school_id, status FROM users WHERE role = 'nonteachingstaff'"
        );
        console.log('\n=== All nonteachingstaff users in `users` table ===');
        console.table(allUsers);

        // All records in non_teaching_staff table
        const [allStaff] = await db.query(
            "SELECT id, user_id, name, email, phone, school_id, status FROM non_teaching_staff"
        );
        console.log('\n=== All records in `non_teaching_staff` table ===');
        console.table(allStaff);

        // Orphaned: in users but NOT in non_teaching_staff
        const [orphaned] = await db.query(`
            SELECT u.id, u.name, u.email, u.phone, u.school_id, u.status 
            FROM users u 
            WHERE u.role = 'nonteachingstaff' 
            AND u.id NOT IN (SELECT COALESCE(user_id, 0) FROM non_teaching_staff)
        `);
        console.log('\n=== ORPHANED: In users but missing from non_teaching_staff ===');
        console.table(orphaned);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

findOrphaned();
