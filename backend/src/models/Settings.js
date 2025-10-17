const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  general: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    timeFormat: { type: String, default: '12h' },
    itemsPerPage: { type: Number, default: 9 },
    defaultView: { type: String, default: 'grid' },
    autoSaveInterval: { type: Number, default: 30 }
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    browserNotifications: { type: Boolean, default: true },
    newAssessment: { type: Boolean, default: true },
    submissionEvaluated: { type: Boolean, default: true },
    deadlineReminder: { type: Boolean, default: true },
    achievementUnlocked: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true }
  },
  appearance: {
    theme: { type: String, default: 'light', enum: ['light', 'dark', 'auto'] },
    primaryColor: { type: String, default: '#3B82F6' },
    fontSize: { type: String, default: 'medium', enum: ['small', 'medium', 'large', 'extra-large'] },
    density: { type: String, default: 'comfortable', enum: ['comfortable', 'compact', 'spacious'] },
    sidebarCollapsed: { type: Boolean, default: false }
  },
  privacy: {
    profileVisibility: { type: String, default: 'instructors', enum: ['everyone', 'instructors', 'private'] },
    showActivityStatus: { type: Boolean, default: true },
    sharePerformance: { type: Boolean, default: false },
    analyticsEnabled: { type: Boolean, default: true }
  },
  accessibility: {
    highContrast: { type: Boolean, default: false },
    reduceMotion: { type: Boolean, default: false },
    screenReaderOptimized: { type: Boolean, default: false },
    keyboardShortcuts: { type: Boolean, default: true },
    largeCursor: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
