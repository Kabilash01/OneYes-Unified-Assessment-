const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    ticketNumber: {
      type: String,
      unique: true,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    subject: {
      type: String,
      enum: ['technical', 'account', 'assessment', 'feedback', 'other'],
      required: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    attachments: [{
      filename: String,
      originalName: String,
      path: String,
      mimeType: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    response: {
      type: String,
      trim: true
    },
    resolution: {
      type: String,
      maxlength: 1000,
    },
    respondedAt: {
      type: Date
    },
    resolvedAt: {
      type: Date
    },
    closedAt: {
      type: Date
    },
    // Engagement metrics
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    lastMessageBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true
  }
);

// Generate ticket number before saving
supportTicketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await mongoose.model('SupportTicket').countDocuments();
    this.ticketNumber = `TICKET-${Date.now()}-${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

// Index for efficient querying
supportTicketSchema.index({ userId: 1, status: 1, createdAt: -1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ status: 1, priority: 1 });

// Instance method to increment message count
supportTicketSchema.methods.incrementMessageCount = async function(userId) {
  this.messageCount += 1;
  this.lastMessageAt = Date.now();
  this.lastMessageBy = userId;
  await this.save();
};

// Instance method to mark as resolved
supportTicketSchema.methods.markAsResolved = async function(resolution) {
  this.status = 'resolved';
  this.resolvedAt = Date.now();
  if (resolution) {
    this.resolution = resolution;
  }
  await this.save();
};

// Instance method to close ticket
supportTicketSchema.methods.closeTicket = async function(resolution) {
  this.status = 'closed';
  this.closedAt = Date.now();
  if (resolution && !this.resolution) {
    this.resolution = resolution;
  }
  await this.save();
};

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
