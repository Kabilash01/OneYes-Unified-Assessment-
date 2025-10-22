const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportTicket',
    required: true,
    index: true,
  },
  
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Message content
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
  
  messageType: {
    type: String,
    enum: ['text', 'file', 'system'],
    default: 'text',
  },
  
  // File attachment (for messageType: 'file')
  attachment: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    path: String,
  },
  
  // Read status tracking
  isRead: {
    type: Boolean,
    default: false,
  },
  
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Edit tracking
  isEdited: {
    type: Boolean,
    default: false,
  },
  
  editedAt: {
    type: Date,
  },
  
  originalMessage: {
    type: String,
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
  },
  
  deletedAt: {
    type: Date,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Indexes for better query performance
chatMessageSchema.index({ ticket: 1, createdAt: -1 });
chatMessageSchema.index({ ticket: 1, isRead: 1 });
chatMessageSchema.index({ sender: 1, createdAt: -1 });

// Virtual for time since creation
chatMessageSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
});

// Instance method to mark as read by user
chatMessageSchema.methods.markAsReadBy = async function(userId) {
  // Check if already read by this user
  const alreadyRead = this.readBy.some(r => r.user.toString() === userId.toString());
  
  if (!alreadyRead) {
    this.readBy.push({ user: userId, readAt: new Date() });
    this.isRead = true;
    await this.save();
  }
};

// Instance method to edit message
chatMessageSchema.methods.editMessage = async function(newMessage) {
  if (!this.originalMessage) {
    this.originalMessage = this.message;
  }
  this.message = newMessage;
  this.isEdited = true;
  this.editedAt = new Date();
  await this.save();
};

// Instance method to soft delete message
chatMessageSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.message = '[Message deleted]';
  await this.save();
};

// Static method to get unread count for a ticket
chatMessageSchema.statics.getUnreadCount = async function(ticketId, userId) {
  return await this.countDocuments({
    ticket: ticketId,
    sender: { $ne: userId },
    isRead: false,
    isDeleted: false,
  });
};

// Static method to mark all messages as read for a ticket
chatMessageSchema.statics.markAllAsRead = async function(ticketId, userId) {
  const messages = await this.find({
    ticket: ticketId,
    sender: { $ne: userId },
    isRead: false,
    isDeleted: false,
  });
  
  for (const message of messages) {
    await message.markAsReadBy(userId);
  }
  
  return messages.length;
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
