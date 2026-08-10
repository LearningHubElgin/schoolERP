const db = require('../config/database');

async function deleteOrphaned() {
    try {
        const [result] = await db.query(
            "DELETE FROM users WHERE id IN (450, 3756) AND role = 'nonteachingstaff'"
        );
        console.log('Deleted', result.affectedRows, 'orphaned user(s)');

        const [check] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'nonteachingstaff'");
        console.log('Remaining nonteachingstaff users:', check[0].count);

        const [staff] = await db.query("SELECT COUNT(*) as count FROM non_teaching_staff");
        console.log('Non-teaching staff records:', staff[0].count);

        console.log('\n✅ Counts now match!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

deleteOrphaned();
