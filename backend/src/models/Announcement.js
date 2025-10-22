const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Announcement message is required'],
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'instructors', 'admins', 'custom'],
    default: 'all',
    required: true
  },
  targetUserIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  targetRoles: [{
    type: String,
    enum: ['student', 'instructor', 'admin']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimetype: String
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  sendEmail: {
    type: Boolean,
    default: false
  },
  sendNotification: {
    type: Boolean,
    default: true
  },
  emailSentCount: {
    type: Number,
    default: 0
  },
  notificationSentCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
announcementSchema.index({ createdBy: 1, createdAt: -1 });
announcementSchema.index({ targetAudience: 1, isActive: 1, publishDate: -1 });
announcementSchema.index({ isPinned: -1, publishDate: -1 });
announcementSchema.index({ priority: 1, isActive: 1 });
announcementSchema.index({ expiryDate: 1 }, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { expiryDate: { $exists: true } }
});

// Virtual for checking if announcement is expired
announcementSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Virtual for checking if announcement is published
announcementSchema.virtual('isPublished').get(function() {
  return new Date() >= this.publishDate;
});

// Method to increment view count
announcementSchema.methods.incrementView = async function(userId) {
  // Check if user already viewed
  const alreadyViewed = this.viewedBy.some(
    view => view.userId.toString() === userId.toString()
  );

  if (!alreadyViewed) {
    this.viewCount += 1;
    this.viewedBy.push({ userId, viewedAt: new Date() });
    await this.save();
  }
};

// Method to check if user has viewed
announcementSchema.methods.hasUserViewed = function(userId) {
  return this.viewedBy.some(
    view => view.userId.toString() === userId.toString()
  );
};

// Static method to get active announcements for a user
announcementSchema.statics.getActiveAnnouncementsForUser = async function(user) {
  const now = new Date();
  
  const query = {
    isActive: true,
    publishDate: { $lte: now },
    $and: [
      {
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: { $gte: now } }
        ]
      },
      {
        $or: [
          { targetAudience: 'all' },
          { targetAudience: user.role + 's' }, // students, instructors, admins
          { targetUserIds: user._id }
        ]
      }
    ]
  };

  return this.find(query)
    .sort({ isPinned: -1, publishDate: -1 })
    .populate('createdBy', 'name email role')
    .lean();
};

// Static method to get pinned announcements
announcementSchema.statics.getPinnedAnnouncements = async function(userRole) {
  const now = new Date();
  
  return this.find({
    isActive: true,
    isPinned: true,
    publishDate: { $lte: now },
    $and: [
      {
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: { $gte: now } }
        ]
      },
      {
        $or: [
          { targetAudience: 'all' },
          { targetAudience: userRole + 's' }
        ]
      }
    ]
  })
    .sort({ publishDate: -1 })
    .limit(3)
    .populate('createdBy', 'name email')
    .lean();
};

// Static method to clean up expired announcements
announcementSchema.statics.deactivateExpired = async function() {
  const now = new Date();
  
  const result = await this.updateMany(
    {
      isActive: true,
      expiryDate: { $lt: now }
    },
    {
      $set: { isActive: false }
    }
  );
  
  return result.modifiedCount;
};

// Ensure virtuals are included in JSON
announcementSchema.set('toJSON', { virtuals: true });
announcementSchema.set('toObject', { virtuals: true });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
