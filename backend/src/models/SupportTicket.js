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
      maxlength: 1000
    },
    attachment: {
      filename: String,
      path: String,
      size: Number
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
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
    respondedAt: {
      type: Date
    },
    resolvedAt: {
      type: Date
    }
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

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
