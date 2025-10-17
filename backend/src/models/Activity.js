const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['assessment_completed', 'score_received', 'assignment_new', 'profile_updated', 'login', 'assessment_started'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  metadata: mongoose.Schema.Types.Mixed,
  relatedId: mongoose.Schema.Types.ObjectId
}, {
  timestamps: true
});

activitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
