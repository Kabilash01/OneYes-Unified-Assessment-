const ActivityLog = require('../models/ActivityLog');

/**
 * Activity Logger Middleware
 * @description Logs user and admin actions to the database
 */

/**
 * Create activity log middleware
 * @param {String} action - Action type
 * @param {Object} options - Additional options
 */
const logActivity = (action, options = {}) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send function to log after response
    res.send = function (data) {
      // Log the activity
      logActivityAsync(req, action, options, res.statusCode);
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Async function to log activity
 * @param {Object} req - Request object
 * @param {String} action - Action type
 * @param {Object} options - Additional options
 * @param {Number} statusCode - Response status code
 */
const logActivityAsync = async (req, action, options, statusCode) => {
  try {
    const logData = {
      userId: req.user?._id || req.user?.id,
      action,
      details: options.details || {},
      targetType: options.targetType,
      targetId: options.targetId || req.params.id,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      status: statusCode < 400 ? 'success' : 'failure',
    };

    // Add custom details from request
    if (options.includeBody) {
      logData.details.requestBody = req.body;
    }

    if (options.includeParams) {
      logData.details.params = req.params;
    }

    if (options.includeQuery) {
      logData.details.query = req.query;
    }

    // Add error message if failure
    if (statusCode >= 400) {
      logData.errorMessage = `Request failed with status ${statusCode}`;
    }

    await ActivityLog.log(logData);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error - logging failure should not break the request
  }
};

/**
 * Manual activity logging function
 * Use this for logging activities outside of route handlers
 */
const manualLog = async (logData) => {
  try {
    await ActivityLog.log(logData);
  } catch (error) {
    console.error('Error manually logging activity:', error);
  }
};

/**
 * Middleware to log authentication actions
 */
const logAuth = (action) => logActivity(action, {
  details: { action: `User ${action}` },
  targetType: 'User',
});

/**
 * Middleware to log assessment actions
 */
const logAssessment = (action) => logActivity(action, {
  targetType: 'Assessment',
  includeParams: true,
});

/**
 * Middleware to log submission actions
 */
const logSubmission = (action) => logActivity(action, {
  targetType: 'Submission',
  includeParams: true,
});

/**
 * Middleware to log admin actions
 */
const logAdmin = (action) => logActivity(action, {
  includeBody: true,
  includeParams: true,
  details: { adminAction: action },
});

/**
 * Middleware to log user management actions
 */
const logUserManagement = (action) => logActivity(action, {
  targetType: 'User',
  includeParams: true,
  includeBody: true,
});

/**
 * Get user activity logs
 * @param {String} userId - User ID
 * @param {Number} limit - Number of logs to retrieve
 */
const getUserLogs = async (userId, limit = 50) => {
  return await ActivityLog.getUserActivity(userId, limit);
};

/**
 * Get filtered logs
 * @param {Object} filters - Filter criteria
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 */
const getFilteredLogs = async (filters, page, limit) => {
  return await ActivityLog.getFilteredLogs(filters, page, limit);
};

/**
 * Delete old logs
 * @param {Number} days - Delete logs older than this many days
 */
const deleteOldLogs = async (days = 180) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const result = await ActivityLog.deleteMany({
    createdAt: { $lt: cutoffDate },
  });
  
  return result.deletedCount;
};

module.exports = {
  logActivity,
  manualLog,
  logAuth,
  logAssessment,
  logSubmission,
  logAdmin,
  logUserManagement,
  getUserLogs,
  getFilteredLogs,
  deleteOldLogs,
};
