const db = require('../config/database');
const jwt = require('jsonwebtoken');

/**
 * Enterprise Activity Logger Utility
 * Captures audit trail logs for all CRUD, auth, export, and status operations.
 */

// Simple user-agent parser
const parseUserAgent = (uaString = '') => {
  if (!uaString) return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
  
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let device = 'Desktop';

  const ua = String(uaString).toLowerCase();

  // Device detection
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    device = 'Mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = 'Tablet';
  }

  // OS detection
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Browser / Mobile App detection
  if (/wv|cordova|capacitor|expo|reactnative|okhttp|schoolerp|mobileapp/i.test(ua)) {
    browser = 'Mobile App';
  } else if (/samsungbrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/opr|opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/chrome|crios/i.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  } else {
    browser = 'Web Browser';
  }

  return { browser, os, device };
};

// Compute changed fields between old object and new object
const computeDiff = (oldVal, newVal) => {
  if (!oldVal || !newVal || typeof oldVal !== 'object' || typeof newVal !== 'object') {
    return [];
  }
  const changed = [];
  const keys = new Set([...Object.keys(oldVal), ...Object.keys(newVal)]);
  
  const ignoredKeys = ['password', 'confirmPassword', '_id', '__v', 'created_at', 'updated_at'];

  for (const key of keys) {
    if (ignoredKeys.includes(key)) continue;
    const v1 = oldVal[key];
    const v2 = newVal[key];

    if (v1 === undefined && v2 !== undefined) {
      changed.push(key);
    } else if (v1 !== undefined && v2 === undefined) {
      changed.push(key);
    } else if (typeof v1 === 'object' || typeof v2 === 'object') {
      if (JSON.stringify(v1) !== JSON.stringify(v2)) {
        changed.push(key);
      }
    } else if (String(v1) !== String(v2)) {
      changed.push(key);
    }
  }
  return changed;
};

// Main async log function (runs in background without blocking response)
const logActivity = async (opts = {}) => {
  try {
    const {
      schoolId,
      branchId = null,
      academicYearId = null,
      moduleName = 'General',
      action = 'System Action',
      entityType = null,
      entityId = null,
      entityName = null,
      description = null,
      oldValue = null,
      newValue = null,
      changedFields = null,
      user = null,
      req = null,
      status = 'success',
      failureReason = null,
      sessionId = null,
      severity = 'info',
      executionTime = null,
      requestId = null,
      correlationId = null
    } = opts;

    let finalSchoolId = schoolId;
    let performedByUserId = 0;
    let performedByName = 'System';
    let performedByRole = 'system';
    let ipAddress = '127.0.0.1';
    let userAgentStr = '';
    let reqMethod = null;
    let reqUrl = null;

    if (req) {
      ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
      if (ipAddress.includes('::ffff:')) ipAddress = ipAddress.replace('::ffff:', '');
      userAgentStr = req.headers['user-agent'] || '';
      reqMethod = req.method;
      reqUrl = req.originalUrl || req.url;

      // Extract user from req
      if (!user && req.user) {
        performedByUserId = req.user.id || req.user.user_id || 0;
        performedByName = req.user.name || req.user.user_name || req.user.email || 'User';
        performedByRole = req.user.role || 'user';
        if (!finalSchoolId) finalSchoolId = req.user.school_id;
      }
    }

    if (user) {
      performedByUserId = user.id || user.user_id || performedByUserId;
      performedByName = user.name || user.user_name || user.email || performedByName;
      performedByRole = user.role || performedByRole;
      if (!finalSchoolId) finalSchoolId = user.school_id;
    }

    // Fallback school_id
    if (!finalSchoolId) finalSchoolId = 1;

    const { browser, os, device } = parseUserAgent(userAgentStr);

    // Auto calculate diff if oldValue and newValue provided but changedFields is empty
    let finalChanged = changedFields;
    if (!finalChanged && oldValue && newValue) {
      finalChanged = computeDiff(oldValue, newValue);
    }

    const query = `
      INSERT INTO activity_logs (
        school_id, branch_id, academic_year_id, module_name, action,
        entity_type, entity_id, entity_name, description,
        old_value, new_value, changed_fields,
        performed_by_user_id, performed_by_name, performed_by_role,
        ip_address, browser, device, operating_system,
        request_method, request_url, status, failure_reason,
        session_id, severity, execution_time, request_id, correlation_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      finalSchoolId,
      branchId,
      academicYearId,
      moduleName,
      action,
      entityType,
      entityId ? String(entityId) : null,
      entityName,
      description,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      finalChanged ? JSON.stringify(finalChanged) : null,
      performedByUserId,
      performedByName,
      performedByRole,
      ipAddress,
      browser,
      device,
      os,
      reqMethod,
      reqUrl,
      status,
      failureReason,
      sessionId,
      severity,
      executionTime,
      requestId,
      correlationId
    ];

    // Asynchronously insert into database
    db.query(query, params).catch(err => {
      console.error('❌ Error writing activity_log:', err.message);
    });

  } catch (err) {
    console.error('❌ Activity Logger Error:', err);
  }
};

// Helper: Log Creation
const logCreate = async ({ schoolId, branchId, moduleName, entityType, entityId, entityName, data, description, user, req, severity = 'info' }) => {
  return logActivity({
    schoolId,
    branchId,
    moduleName,
    action: `Create ${entityType || 'Record'}`,
    entityType,
    entityId,
    entityName: entityName || (data ? (data.name || data.title || data.student_name) : null),
    description: description || `Created new ${entityType || 'record'}${entityName ? `: ${entityName}` : ''}`,
    newValue: data,
    user,
    req,
    status: 'success',
    severity
  });
};

// Helper: Log Update
const logUpdate = async ({ schoolId, branchId, moduleName, entityType, entityId, entityName, oldData, newData, description, user, req, severity = 'info' }) => {
  const changed = computeDiff(oldData, newData);
  if (!changed || changed.length === 0) {
    // No fields were actually modified when Save was clicked
    return;
  }
  return logActivity({
    schoolId,
    branchId,
    moduleName,
    action: `Update ${entityType || 'Record'}`,
    entityType,
    entityId,
    entityName: entityName || (oldData?.name || newData?.name || oldData?.student_name || newData?.student_name || null),
    description: description || `Updated ${entityType || 'record'}${entityName ? `: ${entityName}` : ''}`,
    oldValue: oldData,
    newValue: newData,
    changedFields: changed,
    user,
    req,
    status: 'success',
    severity
  });
};

// Helper: Log Delete
const logDelete = async ({ schoolId, branchId, moduleName, entityType, entityId, entityName, data, description, user, req, severity = 'warning' }) => {
  return logActivity({
    schoolId,
    branchId,
    moduleName,
    action: `Delete ${entityType || 'Record'}`,
    entityType,
    entityId,
    entityName: entityName || (data ? (data.name || data.title) : null),
    description: description || `Deleted ${entityType || 'record'}${entityName ? `: ${entityName}` : ''}`,
    oldValue: data,
    user,
    req,
    status: 'success',
    severity
  });
};

// Helper: Log Custom Action
const logAction = async ({ schoolId, branchId, moduleName, action, entityType, entityId, entityName, description, oldValue, newValue, user, req, status = 'success', failureReason = null, severity = 'info' }) => {
  return logActivity({
    schoolId,
    branchId,
    moduleName,
    action,
    entityType,
    entityId,
    entityName,
    description,
    oldValue,
    newValue,
    user,
    req,
    status,
    failureReason,
    severity
  });
};

// Helper: Log Failed Operation
const logFailed = async ({ schoolId, branchId, moduleName, action, entityType, entityId, entityName, description, failureReason, user, req, severity = 'error' }) => {
  return logActivity({
    schoolId,
    branchId,
    moduleName,
    action: action || 'Failed Action',
    entityType,
    entityId,
    entityName,
    description: description || failureReason,
    failureReason,
    user,
    req,
    status: 'failed',
    severity
  });
};

module.exports = {
  logActivity,
  logCreate,
  logUpdate,
  logDelete,
  logAction,
  logFailed,
  computeDiff
};
