const mongoose = require('mongoose');

/**
 * Activity Log Schema
 * @description Schema for tracking all user and admin actions across the platform
 */
const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: {
        values: [
          // Authentication
          'login',
          'logout',
          'register',
          'password_reset',
          'password_change',
          
          // Student actions
          'assessment_started',
          'assessment_submitted',
          'answer_saved',
          'submission_viewed',
          
          // Instructor actions
          'assessment_created',
          'assessment_published',
          'assessment_updated',
          'assessment_deleted',
          'submission_graded',
          
          // Admin actions
          'user_created',
          'user_updated',
          'user_deleted',
          'user_status_changed',
          'assessment_flagged',
          'assessment_archived',
          'branding_updated',
          'data_archived',
          'settings_changed',
          
          // System actions
          'profile_updated',
          'settings_updated',
          'notification_read',
          'file_uploaded',
          'export_generated',
        ],
        message: 'Invalid action type',
      },
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    targetType: {
      type: String,
      enum: ['User', 'Assessment', 'Submission', 'Settings', 'System', 'Other'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning'],
      default: 'success',
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

// TTL index to auto-delete logs older than 6 months (optional)
// activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 }); // 180 days

/**
 * Static method to log an activity
 * @param {Object} logData - Activity log data
 */
activityLogSchema.statics.log = async function (logData) {
  try {
    return await this.create(logData);
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

/**
 * Static method to get user activity
 * @param {String} userId - User ID
 * @param {Number} limit - Number of logs to retrieve
 */
activityLogSchema.statics.getUserActivity = async function (userId, limit = 50) {
  return await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email role');
};

/**
 * Static method to get logs with filters
 * @param {Object} filters - Filter criteria
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 */
activityLogSchema.statics.getFilteredLogs = async function (filters = {}, page = 1, limit = 50) {
  const query = {};
  
  if (filters.userId) query.userId = filters.userId;
  if (filters.action) query.action = filters.action;
  if (filters.status) query.status = filters.status;
  
  // Date range filter
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  const skip = (page - 1) * limit;
  
  const logs = await this.find(query)
    .populate('userId', 'name email role profilePic')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await this.countDocuments(query);
  
  return {
    logs,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);
