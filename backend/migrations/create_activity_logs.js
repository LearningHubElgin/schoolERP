const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_erp'
  });

  console.log('🚀 Running activity_logs table migration...');

  const createTableSQL = `
  CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    school_id INT NOT NULL,
    branch_id INT DEFAULT NULL,
    academic_year_id INT DEFAULT NULL,
    module_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) DEFAULT NULL,
    entity_id VARCHAR(100) DEFAULT NULL,
    entity_name VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    old_value JSON DEFAULT NULL,
    new_value JSON DEFAULT NULL,
    changed_fields JSON DEFAULT NULL,
    performed_by_user_id INT NOT NULL,
    performed_by_name VARCHAR(255) DEFAULT NULL,
    performed_by_role VARCHAR(100) DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    browser VARCHAR(255) DEFAULT NULL,
    device VARCHAR(255) DEFAULT NULL,
    operating_system VARCHAR(255) DEFAULT NULL,
    request_method VARCHAR(10) DEFAULT NULL,
    request_url VARCHAR(500) DEFAULT NULL,
    status ENUM('success', 'failed') DEFAULT 'success',
    failure_reason TEXT DEFAULT NULL,
    session_id VARCHAR(255) DEFAULT NULL,
    severity ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
    execution_time INT DEFAULT NULL,
    request_id VARCHAR(100) DEFAULT NULL,
    correlation_id VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_school_id (school_id),
    INDEX idx_branch_id (branch_id),
    INDEX idx_module_name (module_name),
    INDEX idx_action (action),
    INDEX idx_entity_id (entity_id),
    INDEX idx_performed_by_user_id (performed_by_user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await db.query(createTableSQL);
    console.log('✅ Table activity_logs created successfully with indexes!');

    // Insert sample initial audit log
    await db.query(`
      INSERT INTO activity_logs 
      (school_id, module_name, action, entity_type, entity_name, description, performed_by_user_id, performed_by_name, performed_by_role, status, severity)
      VALUES (1, 'System', 'Audit Trail Initialized', 'System', 'Activity Logger', 'Centralized Audit Trail & Activity Logging initialized.', 1, 'Super Admin', 'superadmin', 'success', 'info')
    `);
    console.log('✅ Initial seed activity log created.');

  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await db.end();
  }
}

migrate();
