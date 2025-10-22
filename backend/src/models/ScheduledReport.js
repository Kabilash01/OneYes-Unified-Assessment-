const mongoose = require('mongoose');

const scheduledReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  format: {
    type: String,
    enum: ['pdf', 'excel'],
    default: 'pdf'
  },
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lastSent: {
    type: Date
  },
  nextRun: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of due reports
scheduledReportSchema.index({ nextRun: 1, isActive: 1 });
scheduledReportSchema.index({ userId: 1 });

module.exports = mongoose.model('ScheduledReport', scheduledReportSchema);
