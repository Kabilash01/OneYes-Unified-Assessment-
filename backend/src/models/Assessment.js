const mongoose = require('mongoose');

/**
 * Question Schema (Embedded)
 * @description Schema for individual questions within an assessment
 */
const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['mcq', 'short', 'long'],
        message: 'Question type must be mcq, short, or long',
      },
      required: [true, 'Question type is required'],
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: function (value) {
          // Options required only for MCQ type
          if (this.type === 'mcq') {
            return value && value.length >= 2;
          }
          return true;
        },
        message: 'MCQ questions must have at least 2 options',
      },
    },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed, // String for MCQ index/short/long, can be flexible
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [0, 'Marks cannot be negative'],
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

/**
 * Assessment Schema
 * @description Schema for assessments created by instructors
 */
const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: [0, 'Total marks cannot be negative'],
    },
    subjects: {
      type: [String],
      default: [],
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message: 'Assessment must have at least one question',
      },
    },
    assignedTo: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'archived'],
        message: 'Status must be draft, published, or archived',
      },
      default: 'draft',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          // End date must be after start date
          if (this.startDate && value) {
            return value > this.startDate;
          }
          return true;
        },
        message: 'End date must be after start date',
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Virtual for checking if assessment is currently active
 */
assessmentSchema.virtual('isActive').get(function () {
  if (this.status !== 'published') return false;
  
  const now = new Date();
  const isAfterStart = !this.startDate || now >= this.startDate;
  const isBeforeEnd = !this.endDate || now <= this.endDate;
  
  return isAfterStart && isBeforeEnd;
});

/**
 * Calculate total marks from questions
 */
assessmentSchema.methods.calculateTotalMarks = function () {
  return this.questions.reduce((sum, q) => sum + q.marks, 0);
};

// Indexes for better query performance
assessmentSchema.index({ createdBy: 1, status: 1 });
assessmentSchema.index({ status: 1, startDate: 1, endDate: 1 });
assessmentSchema.index({ subjects: 1 });
assessmentSchema.index({ assignedTo: 1 });

// Ensure virtuals are included in JSON
assessmentSchema.set('toJSON', { virtuals: true });
assessmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
