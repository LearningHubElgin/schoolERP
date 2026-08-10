const db = require('../config/database');

async function listAndDelete() {
    try {
        const [rows] = await db.query('SELECT id, name FROM marksheet_templates');
        console.log('Current Templates:', rows);
        
        const target = rows.find(r => r.name === 'Class 1');
        if (target) {
            console.log('Deleting template "Class 1" with ID:', target.id);
            await db.query('DELETE FROM marksheet_templates WHERE id = ?', [target.id]);
            console.log('Deleted successfully.');
        } else {
            console.log('No template named "Class 1" found.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listAndDelete();
