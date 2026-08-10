const db = require('../config/database');

/**
 * Scheduled Log Retention Cleanup Job
 * Automatically runs once daily to delete old logs based on retention policy (default: 365 days)
 */
const runRetentionCleanup = async (daysToKeep = 365) => {
  try {
    const indianTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[${indianTime}] 🧹 Running Activity Logs Retention Cleanup (Keeping last ${daysToKeep} days)...`);
    
    const [result] = await db.query(
      'DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)', 
      [daysToKeep]
    );

    if (result.affectedRows > 0) {
      console.log(`[${indianTime}] ✅ Retention Cleanup: Removed ${result.affectedRows} archived audit log records.`);
    } else {
      console.log(`[${indianTime}] ℹ️ Retention Cleanup: No obsolete audit log records found.`);
    }
  } catch (err) {
    console.error('❌ Retention Cleanup Error:', err);
  }
};

// Initialize periodic background job (runs every 24 hours)
const initRetentionJob = (daysToKeep = 365) => {
  // Run 1 minute after server startup
  setTimeout(() => {
    runRetentionCleanup(daysToKeep);
  }, 60000);

  // Schedule daily interval (24 hours)
  setInterval(() => {
    runRetentionCleanup(daysToKeep);
  }, 24 * 60 * 60 * 1000);
};

module.exports = {
  runRetentionCleanup,
  initRetentionJob
};
