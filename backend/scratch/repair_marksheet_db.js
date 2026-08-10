const db = require('../config/database');

async function repairDB() {
    try {
        console.log('Checking marksheet_templates table...');
        const [columns] = await db.query('SHOW COLUMNS FROM marksheet_templates');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('assigned_class')) {
            console.log('Adding assigned_class column...');
            await db.query('ALTER TABLE marksheet_templates ADD COLUMN assigned_class TEXT DEFAULT NULL');
        }

        if (!columnNames.includes('assigned_section')) {
            console.log('Adding assigned_section column...');
            await db.query('ALTER TABLE marksheet_templates ADD COLUMN assigned_section VARCHAR(255) DEFAULT NULL');
        }

        if (!columnNames.includes('assigned_stream')) {
            console.log('Adding assigned_stream column...');
            await db.query('ALTER TABLE marksheet_templates ADD COLUMN assigned_stream VARCHAR(255) DEFAULT NULL');
        }

        console.log('Database repair complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error repairing database:', err);
        process.exit(1);
    }
}

repairDB();
