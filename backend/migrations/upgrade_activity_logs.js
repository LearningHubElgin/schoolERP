const mysql = require('mysql2/promise');
require('dotenv').config();

async function inspect() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_erp'
  });

  try {
    const [cols] = await db.query('DESCRIBE activity_logs');
    console.log('Existing columns in activity_logs:', cols.map(c => c.Field));

    // Check columns and alter table if needed
    const existing = cols.map(c => c.Field);
    
    const requiredCols = [
      { name: 'school_id', type: 'INT NOT NULL DEFAULT 1' },
      { name: 'branch_id', type: 'INT DEFAULT NULL' },
      { name: 'academic_year_id', type: 'INT DEFAULT NULL' },
      { name: 'module_name', type: 'VARCHAR(100) NOT NULL DEFAULT "System"' },
      { name: 'action', type: 'VARCHAR(100) NOT NULL DEFAULT "Action"' },
      { name: 'entity_type', type: 'VARCHAR(100) DEFAULT NULL' },
      { name: 'entity_id', type: 'VARCHAR(100) DEFAULT NULL' },
      { name: 'entity_name', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'description', type: 'TEXT DEFAULT NULL' },
      { name: 'old_value', type: 'JSON DEFAULT NULL' },
      { name: 'new_value', type: 'JSON DEFAULT NULL' },
      { name: 'changed_fields', type: 'JSON DEFAULT NULL' },
      { name: 'performed_by_user_id', type: 'INT NOT NULL DEFAULT 0' },
      { name: 'performed_by_name', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'performed_by_role', type: 'VARCHAR(100) DEFAULT NULL' },
      { name: 'ip_address', type: 'VARCHAR(45) DEFAULT NULL' },
      { name: 'browser', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'device', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'operating_system', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'request_method', type: 'VARCHAR(10) DEFAULT NULL' },
      { name: 'request_url', type: 'VARCHAR(500) DEFAULT NULL' },
      { name: 'status', type: "ENUM('success', 'failed') DEFAULT 'success'" },
      { name: 'failure_reason', type: 'TEXT DEFAULT NULL' },
      { name: 'session_id', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'severity', type: "ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info'" },
      { name: 'execution_time', type: 'INT DEFAULT NULL' },
      { name: 'request_id', type: 'VARCHAR(100) DEFAULT NULL' },
      { name: 'correlation_id', type: 'VARCHAR(100) DEFAULT NULL' }
    ];

    for (const col of requiredCols) {
      if (!existing.includes(col.name)) {
        console.log(`Adding missing column ${col.name}...`);
        await db.query(`ALTER TABLE activity_logs ADD COLUMN ${col.name} ${col.type}`);
      }
    }

    // Add indexes if missing
    const indexes = [
      'idx_school_id (school_id)',
      'idx_branch_id (branch_id)',
      'idx_module_name (module_name)',
      'idx_action (action)',
      'idx_entity_id (entity_id)',
      'idx_performed_by_user_id (performed_by_user_id)',
      'idx_created_at (created_at)',
      'idx_status (status)'
    ];

    for (const idx of indexes) {
      const idxName = idx.split(' ')[0];
      try {
        await db.query(`ALTER TABLE activity_logs ADD INDEX ${idx}`);
        console.log(`Added index ${idxName}`);
      } catch (e) {
        // Index likely exists
      }
    }

    console.log('✅ Table activity_logs successfully upgraded & indexed!');

    await db.query(`
      INSERT INTO activity_logs 
      (school_id, module_name, action, entity_type, entity_name, description, performed_by_user_id, performed_by_name, performed_by_role, status, severity)
      VALUES (1, 'System', 'Audit Trail Initialized', 'System', 'Activity Logger', 'Centralized Audit Trail & Activity Logging initialized.', 1, 'Super Admin', 'superadmin', 'success', 'info')
    `);
    console.log('✅ Sample audit log record created.');

  } catch (err) {
    console.error('Inspection error:', err);
  } finally {
    await db.end();
  }
}

inspect();
