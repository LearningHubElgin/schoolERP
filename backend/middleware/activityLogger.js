const { logActivity: mainLogActivity, logAction, logCreate, logUpdate, logDelete, logFailed } = require('../utils/activityLogger');

/**
 * Backward compatible activityLogger middleware wrapper.
 * Integrates directly with the enterprise Activity Logging Utility.
 */
const logActivity = async (req, action, details, status = 'Success') => {
  try {
    const isSuccess = String(status).toLowerCase() === 'success';
    let moduleName = 'General';

    if (req?.originalUrl || req?.url) {
      const url = (req.originalUrl || req.url).toLowerCase();
      if (url.includes('/student')) moduleName = 'Students';
      else if (url.includes('/teacher')) moduleName = 'Teachers';
      else if (url.includes('/staff')) moduleName = 'Non-Teaching Staff';
      else if (url.includes('/accounts') || url.includes('/fee') || url.includes('/salary') || url.includes('/expense') || url.includes('/requisition')) moduleName = 'Fees & Finance';
      else if (url.includes('/auth')) moduleName = 'Authentication';
      else if (url.includes('/library')) moduleName = 'Library';
      else if (url.includes('/transport') || url.includes('/driver')) moduleName = 'Transport';
      else if (url.includes('/store')) moduleName = 'Store & Inventory';
      else if (url.includes('/marks') || url.includes('/exam')) moduleName = 'Examinations & Marks';
      else if (url.includes('/attendance')) moduleName = 'Attendance';
      else if (url.includes('/notice') || url.includes('/event') || url.includes('/holiday')) moduleName = 'Notice Board & Events';
      else if (url.includes('/certificate') || url.includes('/bonafide') || url.includes('/transfer') || url.includes('/card')) moduleName = 'Certificates';
      else if (url.includes('/visitor')) moduleName = 'Visitors';
      else if (url.includes('/school-settings') || url.includes('/academic') || url.includes('/class')) moduleName = 'School Settings';
      else if (url.includes('/superadmin')) moduleName = 'Super Admin';
    }

    await mainLogActivity({
      schoolId: req?.user?.school_id || req?.body?.school_id || 1,
      moduleName,
      action: action || 'User Action',
      description: details || action,
      status: isSuccess ? 'success' : 'failed',
      failureReason: !isSuccess ? details : null,
      user: req?.user,
      req,
      severity: isSuccess ? 'info' : 'warning'
    });
  } catch (err) {
    console.error('Error in backward compatible logActivity:', err);
  }
};

/**
 * Express Middleware function for route-level execution
 */
const activityLogger = (action, detailsTemplate, defaultStatus = 'Success') => {
  return async (req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode < 400) {
        logActivity(req, action, detailsTemplate, defaultStatus);
      } else {
        logActivity(req, action, `${detailsTemplate} (Failed with status ${res.statusCode})`, 'Failed');
      }
    });
    next();
  };
};

/**
 * Universal Auto Audit Logger Middleware for Express
 * Automatically captures POST, PUT, DELETE, PATCH requests across ALL routes
 */
const autoAuditLogger = (req, res, next) => {
  const method = req.method.toUpperCase();
  // Only intercept write operations (skip read-only GET, OPTIONS, HEAD)
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return next();
  }

  const url = (req.originalUrl || req.url || '').toLowerCase();
  // Skip activity logs and login routes to avoid circular loops
  if (url.includes('/api/activity-logs') || url.includes('/api/auth/login')) {
    return next();
  }

  res.on('finish', () => {
    // Only log successful modifications (HTTP 200 - 399)
    if (res.statusCode >= 200 && res.statusCode < 400) {
      let moduleName = 'System';
      let actionType = 'Action';

      if (method === 'POST') actionType = 'Create';
      else if (method === 'PUT' || method === 'PATCH') actionType = 'Update';
      else if (method === 'DELETE') actionType = 'Delete';

      let entityName = 'Record';
      if (url.includes('/student')) { moduleName = 'Students'; entityName = 'Student'; }
      else if (url.includes('/teacher')) { moduleName = 'Teachers'; entityName = 'Teacher'; }
      else if (url.includes('/staff')) { moduleName = 'Non-Teaching Staff'; entityName = 'Staff Member'; }
      else if (url.includes('/fee')) { moduleName = 'Fees & Finance'; entityName = 'Fee Record'; }
      else if (url.includes('/accounts') || url.includes('/expense') || url.includes('/voucher')) { moduleName = 'Accounts & Vouchers'; entityName = 'Transaction'; }
      else if (url.includes('/salary') || url.includes('/payroll')) { moduleName = 'Payroll'; entityName = 'Salary Record'; }
      else if (url.includes('/library') || url.includes('/book')) { moduleName = 'Library'; entityName = 'Book Record'; }
      else if (url.includes('/transport') || url.includes('/vehicle') || url.includes('/route')) { moduleName = 'Transport'; entityName = 'Transport Record'; }
      else if (url.includes('/store') || url.includes('/inventory') || url.includes('/item')) { moduleName = 'Store & Inventory'; entityName = 'Inventory Item'; }
      else if (url.includes('/marks') || url.includes('/exam') || url.includes('/grade') || url.includes('/template')) { moduleName = 'Examinations & Marks'; entityName = 'Marks Sheet/Template'; }
      else if (url.includes('/attendance')) { moduleName = 'Attendance'; entityName = 'Attendance'; }
      else if (url.includes('/timetable')) { moduleName = 'Classes & Sections'; entityName = 'Timetable'; }
      else if (url.includes('/class') || url.includes('/section') || url.includes('/stream')) { moduleName = 'Classes & Sections'; entityName = 'Class/Section'; }
      else if (url.includes('/subject')) { moduleName = 'Subjects & Timetable'; entityName = 'Subject'; }
      else if (url.includes('/notice') || url.includes('/event') || url.includes('/holiday')) { moduleName = 'Notice Board & Events'; entityName = 'Notice/Event/Holiday'; }
      else if (url.includes('/certificate') || url.includes('/bonafide') || url.includes('/card')) { moduleName = 'Certificates'; entityName = 'Certificate/ID Card'; }
      else if (url.includes('/visitor')) { moduleName = 'Visitors'; entityName = 'Visitor Log'; }
      else if (url.includes('/grievance') || url.includes('/requisition') || url.includes('/leave')) { moduleName = 'Requisitions & Grievances'; entityName = 'Request/Leave'; }
      else if (url.includes('/enquiry') || url.includes('/admission')) { moduleName = 'Enquiry & Admission'; entityName = 'Enquiry Form'; }
      else if (url.includes('/school-settings') || url.includes('/academic')) { moduleName = 'School Settings'; entityName = 'School Settings'; }
      else if (url.includes('/superadmin')) { moduleName = 'Super Admin'; entityName = 'School Branch'; }

      const action = `${actionType} ${entityName}`;
      const description = `${actionType} operation executed on ${req.originalUrl || req.url}`;

      // Clean request body data to attach as new_value
      const logBody = req.body ? { ...req.body } : null;
      if (logBody) {
        delete logBody.password;
        delete logBody.token;
      }

      mainLogActivity({
        schoolId: req?.user?.school_id || req?.body?.school_id || 1,
        branchId: req?.user?.branch_id || req?.body?.branch_id || null,
        moduleName,
        action,
        entityType: entityName,
        entityName: req?.body?.name || req?.body?.title || req?.body?.student_name || req?.body?.subject_name || entityName,
        description,
        newValue: logBody,
        user: req?.user,
        req,
        status: 'success',
        severity: method === 'DELETE' ? 'warning' : 'info'
      });
    }
  });

  next();
};

module.exports = {
  logActivity,
  activityLogger,
  autoAuditLogger,
  logAction,
  logCreate,
  logUpdate,
  logDelete,
  logFailed
};
