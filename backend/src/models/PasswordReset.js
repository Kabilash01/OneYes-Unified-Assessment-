const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true
    // Note: indexed via schema.index below (TTL and compound indexes)
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// TTL index to auto-delete expired tokens after 24 hours
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

// Compound index for efficient queries
passwordResetSchema.index({ token: 1, used: 1, expiresAt: 1 });

// Generate a secure random token
passwordResetSchema.statics.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Create a password reset request
passwordResetSchema.statics.createResetRequest = async function(userId, email, ipAddress, userAgent) {
  const token = this.generateToken();
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
  
  const resetRequest = await this.create({
    userId,
    email,
    token,
    expiresAt,
    ipAddress,
    userAgent
  });
  
  return resetRequest;
};

// Verify token validity
passwordResetSchema.statics.verifyToken = async function(token) {
  const resetRequest = await this.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() }
  }).populate('userId', 'name email role');
  
  if (!resetRequest) {
    return null;
  }
  
  return resetRequest;
};

// Mark token as used
passwordResetSchema.methods.markAsUsed = async function() {
  this.used = true;
  this.usedAt = new Date();
  await this.save();
};

// Invalidate all tokens for a user
passwordResetSchema.statics.invalidateUserTokens = async function(userId) {
  await this.updateMany(
    { userId, used: false },
    { $set: { used: true, usedAt: new Date() } }
  );
};

// Clean up expired tokens (manual cleanup if TTL not working)
passwordResetSchema.statics.cleanupExpiredTokens = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result.deletedCount;
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;
