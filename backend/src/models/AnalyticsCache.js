const mongoose = require('mongoose');

const analyticsCacheSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    required: true
  },
  metricType: {
    type: String,
    required: true,
    enum: ['performance', 'engagement', 'distribution', 'overview', 'class', 'platform']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
  }
});

// Compound index for faster lookups
analyticsCacheSchema.index({ userId: 1, metricType: 1, startDate: 1, endDate: 1 });

// TTL index - automatically delete expired cache entries
analyticsCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AnalyticsCache', analyticsCacheSchema);
