const express = require('express');
const router = express.Router();
const db = require('../config/database');
const jwt = require('jsonwebtoken');

// ─── AUTHENTICATION & ROLE AUTHORIZATION MIDDLEWARE ─────────────────
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Check if user is allowed to access Activity Logs
const authorizeActivityLogs = (req, res, next) => {
  const role = (req.user?.role || '').toLowerCase();
  
  if (['student', 'parent'].includes(role)) {
    return res.status(403).json({ success: false, message: 'Access denied. Activity logs are restricted.' });
  }
  next();
};

// Apply auth to all activity log routes
router.use(authenticateUser);
router.use(authorizeActivityLogs);

// Helper for superadmin exclusion condition
const EXCLUDE_SUPERADMIN_SQL = "(performed_by_role IS NOT NULL AND LOWER(performed_by_role) != 'superadmin' AND performed_by_name IS NOT NULL)";

// Standard system modules list
const ALL_SYSTEM_MODULES = [
  'Authentication',
  'User Management',
  'School Settings',
  'Classes & Sections',
  'Subjects & Timetable',
  'Students',
  'Teachers',
  'Non-Teaching Staff',
  'Attendance',
  'Homework & Assignments',
  'Examinations & Marks',
  'Marksheet Templates',
  'Fees & Finance',
  'Accounts & Vouchers',
  'Payroll & Salaries',
  'Library Management',
  'Transport Management',
  'Store & Requisitions',
  'Holidays & Calendar',
  'Notice Board & Events',
  'Grievance Management',
  'Leave Management',
  'Certificates',
  'Visitors',
  'Enquiry & Admissions',
  'ID & Admit Cards',
  'Super Admin'
];

// Standard actions list
const ALL_STANDARD_ACTIONS = [
  'Login',
  'Logout',
  'Create School',
  'Update School',
  'Delete School',
  'Create User',
  'Update User',
  'Delete User',
  'Create Student',
  'Update Student',
  'Delete Student',
  'Student Promoted',
  'Create Teacher',
  'Update Teacher',
  'Delete Teacher',
  'Create Staff',
  'Update Staff',
  'Delete Staff',
  'Create Class',
  'Update Class',
  'Delete Class',
  'Create Section',
  'Delete Section',
  'Create Subject',
  'Update Subject',
  'Delete Subject',
  'Create Timetable',
  'Update Timetable',
  'Student Attendance',
  'Teacher Attendance',
  'Staff Attendance',
  'Fee Collection',
  'Create Fee Structure',
  'Add Expense',
  'Create Voucher',
  'Pay Salary',
  'Enter Marks',
  'Publish Marks',
  'Create Marksheet Template',
  'Issue Book',
  'Return Book',
  'Assign Transport',
  'Generate Certificate',
  'Issue ID Card',
  'Add Holiday',
  'Create Notice',
  'Create Event',
  'File Grievance',
  'Approve Leave',
  'Submit Enquiry',
  'School Settings Updated'
];

// ─── 1. GET /api/activity-logs (Paginated list with rich filters & search) ───
router.get('/', async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    const userSchoolId = req.user.school_id;
    const userBranchId = req.user.branch_id;
    const userId = req.user.id || req.user.user_id;

    // Query parameters
    let {
      page = 1,
      limit = 25,
      school_id,
      branch_id,
      module_name,
      action,
      status,
      severity,
      performed_by_role,
      performed_by_user_id,
      startDate,
      endDate,
      search,
      sortBy = 'id',
      sortOrder = 'DESC'
    } = req.query;

    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 25, 100);
    const offset = (page - 1) * limit;

    // Build SQL WHERE conditions
    const conditions = [];
    const params = [];

    // Role-based data scoping
    if (role !== 'superadmin') {
      // 1. MUST show only that particular school's logs
      conditions.push('school_id = ?');
      params.push(userSchoolId);

      // 2. MUST NOT show superadmin or null system seed logs on school admin page
      conditions.push(EXCLUDE_SUPERADMIN_SQL);

      if (role === 'branch_admin' && userBranchId) {
        conditions.push('branch_id = ?');
        params.push(userBranchId);
      } else if (role === 'accountant') {
        conditions.push("module_name IN ('Fees', 'Accounts', 'Payroll', 'Fees & Finance', 'System')");
      } else if (role === 'librarian') {
        conditions.push("module_name IN ('Library', 'System')");
      } else if (role === 'teacher') {
        conditions.push('(performed_by_user_id = ? OR module_name IN (\'Attendance\', \'Homework\', \'Examinations\', \'Students\'))');
        params.push(userId);
      }
    } else {
      if (school_id) {
        conditions.push('school_id = ?');
        params.push(school_id);
      }
    }

    if (branch_id) {
      conditions.push('branch_id = ?');
      params.push(branch_id);
    }

    if (module_name) {
      conditions.push('module_name = ?');
      params.push(module_name);
    }

    if (action) {
      conditions.push('action = ?');
      params.push(action);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (severity) {
      conditions.push('severity = ?');
      params.push(severity);
    }

    if (performed_by_role) {
      conditions.push('performed_by_role = ?');
      params.push(performed_by_role);
    }

    if (performed_by_user_id) {
      conditions.push('performed_by_user_id = ?');
      params.push(performed_by_user_id);
    }

    if (startDate) {
      conditions.push('created_at >= ?');
      params.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      conditions.push('created_at <= ?');
      params.push(`${endDate} 23:59:59`);
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push('(entity_name LIKE ? OR description LIKE ? OR performed_by_name LIKE ? OR ip_address LIKE ? OR request_url LIKE ?)');
      params.push(q, q, q, q, q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sorting
    const allowedSortFields = ['id', 'created_at', 'module_name', 'action', 'status', 'severity', 'performed_by_name', 'execution_time'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get Total Count
    const countSql = `SELECT COUNT(*) AS total FROM activity_logs ${whereClause}`;
    const [countRows] = await db.query(countSql, params);
    const totalRecords = countRows[0]?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    // Get Records
    const dataSql = `
      SELECT * FROM activity_logs 
      ${whereClause} 
      ORDER BY ${safeSortBy} ${safeSortOrder} 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(dataSql, [...params, limit, offset]);

    // Parse JSON fields safely
    const formattedRows = rows.map(r => ({
      ...r,
      old_value: r.old_value ? (typeof r.old_value === 'string' ? JSON.parse(r.old_value) : r.old_value) : null,
      new_value: r.new_value ? (typeof r.new_value === 'string' ? JSON.parse(r.new_value) : r.new_value) : null,
      changed_fields: r.changed_fields ? (typeof r.changed_fields === 'string' ? JSON.parse(r.changed_fields) : r.changed_fields) : []
    }));

    res.json({
      success: true,
      data: formattedRows,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching activity logs' });
  }
});

// ─── 2. GET /api/activity-logs/summary (Summary metrics & chart data) ───
router.get('/summary', async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    const schoolId = req.user.school_id;

    const conditions = [];
    const params = [];

    if (role !== 'superadmin') {
      conditions.push('school_id = ?');
      params.push(schoolId);
      conditions.push(EXCLUDE_SUPERADMIN_SQL);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Stats calculations
    const [todayCount] = await db.query(`SELECT COUNT(*) as cnt FROM activity_logs ${whereClause ? whereClause + ' AND' : 'WHERE'} DATE(created_at) = CURDATE()`, params);
    const [totalCount] = await db.query(`SELECT COUNT(*) as cnt FROM activity_logs ${whereClause}`, params);
    const [successCount] = await db.query(`SELECT COUNT(*) as cnt FROM activity_logs ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'success'`, params);
    const [failedCount] = await db.query(`SELECT COUNT(*) as cnt FROM activity_logs ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'failed'`, params);

    // Most active user (must have non-null performed_by_name)
    const [topUser] = await db.query(`
      SELECT performed_by_name, performed_by_role, COUNT(*) as cnt 
      FROM activity_logs 
      ${whereClause ? whereClause + ' AND' : 'WHERE'} performed_by_name IS NOT NULL AND performed_by_name != ''
      GROUP BY performed_by_name, performed_by_role 
      ORDER BY cnt DESC LIMIT 1
    `, params);

    // Most active module
    const [topModule] = await db.query(`
      SELECT module_name, COUNT(*) as cnt 
      FROM activity_logs ${whereClause} 
      GROUP BY module_name 
      ORDER BY cnt DESC LIMIT 1
    `, params);

    // 7 Day Timeline
    const [timeline] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, COUNT(*) as count 
      FROM activity_logs 
      ${whereClause ? whereClause + ' AND' : 'WHERE'} created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') 
      ORDER BY date ASC
    `, params);

    // Module Distribution
    const [moduleDist] = await db.query(`
      SELECT module_name, COUNT(*) as count 
      FROM activity_logs ${whereClause} 
      GROUP BY module_name 
      ORDER BY count DESC LIMIT 10
    `, params);

    res.json({
      success: true,
      summary: {
        todayActivities: todayCount[0]?.cnt || 0,
        totalActivities: totalCount[0]?.cnt || 0,
        successfulActions: successCount[0]?.cnt || 0,
        failedActions: failedCount[0]?.cnt || 0,
        mostActiveUser: topUser[0] ? `${topUser[0].performed_by_name} (${topUser[0].cnt})` : 'N/A',
        mostActiveModule: topModule[0] ? `${topModule[0].module_name} (${topModule[0].cnt})` : 'N/A'
      },
      timeline,
      moduleDistribution: moduleDist
    });

  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 3. GET /api/activity-logs/modules (Complete System Modules List) ───
router.get('/modules', async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    const schoolId = req.user.school_id;

    const conditions = [];
    const params = [];
    if (role !== 'superadmin') {
      conditions.push('school_id = ?');
      params.push(schoolId);
      conditions.push(EXCLUDE_SUPERADMIN_SQL);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await db.query(`SELECT DISTINCT module_name FROM activity_logs ${whereClause} ORDER BY module_name ASC`, params);
    
    const dbModules = rows.map(r => r.module_name);
    const combinedModules = Array.from(new Set([...ALL_SYSTEM_MODULES, ...dbModules])).sort();

    res.json({ success: true, modules: combinedModules });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 4. GET /api/activity-logs/actions (Complete Actions List) ───
router.get('/actions', async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    const schoolId = req.user.school_id;

    const conditions = [];
    const params = [];
    if (role !== 'superadmin') {
      conditions.push('school_id = ?');
      params.push(schoolId);
      conditions.push(EXCLUDE_SUPERADMIN_SQL);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await db.query(`SELECT DISTINCT action FROM activity_logs ${whereClause} ORDER BY action ASC`, params);
    
    const dbActions = rows.map(r => r.action);
    const combinedActions = Array.from(new Set([...ALL_STANDARD_ACTIONS, ...dbActions])).sort();

    res.json({ success: true, actions: combinedActions });
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── 5. POST /api/activity-logs/export (Export CSV / JSON) ───
router.post('/export', async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    const schoolId = req.user.school_id;

    const { format = 'csv', module_name, action, status, startDate, endDate } = req.body;

    const conditions = [];
    const params = [];

    if (role !== 'superadmin') {
      conditions.push('school_id = ?');
      params.push(schoolId);
      conditions.push(EXCLUDE_SUPERADMIN_SQL);
    }
    if (module_name) { conditions.push('module_name = ?'); params.push(module_name); }
    if (action) { conditions.push('action = ?'); params.push(action); }
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (startDate) { conditions.push('created_at >= ?'); params.push(`${startDate} 00:00:00`); }
    if (endDate) { conditions.push('created_at <= ?'); params.push(`${endDate} 23:59:59`); }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await db.query(`SELECT * FROM activity_logs ${whereClause} ORDER BY id DESC LIMIT 5000`, params);

    if (format === 'csv') {
      const headers = ['ID', 'Timestamp', 'Module', 'Action', 'Entity Type', 'Entity Name', 'Description', 'Performed By', 'Role', 'IP Address', 'Browser', 'Status'];
      const csvRows = [headers.join(',')];

      rows.forEach(r => {
        const row = [
          r.id,
          `"${new Date(r.created_at).toLocaleString()}"`,
          `"${r.module_name || ''}"`,
          `"${r.action || ''}"`,
          `"${r.entity_type || ''}"`,
          `"${(r.entity_name || '').replace(/"/g, '""')}"`,
          `"${(r.description || '').replace(/"/g, '""')}"`,
          `"${r.performed_by_name || ''}"`,
          `"${r.performed_by_role || ''}"`,
          `"${r.ip_address || ''}"`,
          `"${r.browser || ''}"`,
          `"${r.status || ''}"`
        ];
        csvRows.push(row.join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=Audit_Trail_Export_${new Date().toISOString().slice(0, 10)}.csv`);
      return res.send(csvRows.join('\n'));
    }

    res.json({ success: true, records: rows });

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Export failed' });
  }
});

// ─── 6. DELETE /api/activity-logs/cleanup (Retention Job - Super Admin Only) ───
router.delete('/cleanup', async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    if (role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Only Super Admin can execute log cleanup.' });
    }

    const { days = 90 } = req.body;
    const daysNum = parseInt(days) || 90;

    const [result] = await db.query('DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)', [daysNum]);

    res.json({
      success: true,
      message: `Cleaned up ${result.affectedRows} audit logs older than ${daysNum} days.`,
      deletedCount: result.affectedRows
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ success: false, message: 'Cleanup failed' });
  }
});

module.exports = router;
