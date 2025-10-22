const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
      // Note: index created via compound index below for better query performance
    },
    type: {
      type: String,
      enum: ['user_registered', 'assessment_created', 'suspicious_activity', 'system_alert', 'support_ticket', 'announcement', 'assignment', 'result', 'reminder', 'achievement', 'system'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    link: {
      type: String,
      default: ''
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId
    },
    relatedModel: {
      type: String,
      enum: ['User', 'Assessment', 'ActivityLog', 'Announcement', 'SupportTicket']
    },
    isRead: {
      type: Boolean,
      default: false
      // Note: index created via compound indexes below for better query performance
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    expiresAt: {
      type: Date
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  return notification;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(recipientId) {
  return await this.countDocuments({ recipientId, isRead: false });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  await this.save();
  return this;
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = async function(recipientId) {
  return await this.updateMany(
    { recipientId, isRead: false },
    { $set: { isRead: true } }
  );
};

// Static method to delete old read notifications
notificationSchema.statics.cleanupOldNotifications = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return await this.deleteMany({
    isRead: true,
    createdAt: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
