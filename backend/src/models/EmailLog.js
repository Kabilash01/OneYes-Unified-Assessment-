const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true
  },
  template: {
    type: String,
    enum: ['userCreated', 'userSuspended', 'passwordReset', 'announcementEmail', 'accountReactivated', 'test', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'queued'],
    default: 'sent'
  },
  error: {
    type: String
  },
  messageId: {
    type: String
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  openedAt: {
    type: Date
  },
  clickedAt: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for faster queries
emailLogSchema.index({ recipient: 1, sentAt: -1 });
emailLogSchema.index({ status: 1, sentAt: -1 });
emailLogSchema.index({ template: 1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
