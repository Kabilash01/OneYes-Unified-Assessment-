const mongoose = require('mongoose');

/**
 * Answer Schema (Embedded)
 * @description Schema for individual answers within a submission
 */
const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Question ID is required'],
    },
    answer: {
      type: mongoose.Schema.Types.Mixed, // String for text, Number for MCQ index
      default: null,
    },
    isCorrect: {
      type: Boolean,
      default: null, // Only set for auto-evaluated questions (MCQ)
    },
    marksAwarded: {
      type: Number,
      default: 0,
      min: [0, 'Marks awarded cannot be negative'],
    },
  },
  { _id: true }
);

/**
 * Submission Schema
 * @description Schema for student assessment submissions
 */
const submissionSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: [true, 'Assessment ID is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['in-progress', 'submitted', 'evaluated'],
        message: 'Status must be in-progress, submitted, or evaluated',
      },
      default: 'in-progress',
    },
    score: {
      type: Number,
      default: 0,
      min: [0, 'Score cannot be negative'],
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    evaluatedAt: {
      type: Date,
      default: null,
    },
    timeSpent: {
      type: Number, // Time spent in minutes
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Method to calculate auto-evaluated score (MCQ questions)
 * @param {Array} assessmentQuestions - Questions from the assessment
 * @returns {number} Auto-calculated score
 */
submissionSchema.methods.autoEvaluate = function (assessmentQuestions) {
  let autoScore = 0;

  this.answers.forEach((answer) => {
    const question = assessmentQuestions.find(
      (q) => q._id.toString() === answer.questionId.toString()
    );

    if (question && question.type === 'mcq' && question.correctAnswer !== undefined) {
      // Check if answer matches correct answer
      const isCorrect = answer.answer?.toString() === question.correctAnswer?.toString();
      answer.isCorrect = isCorrect;
      answer.marksAwarded = isCorrect ? question.marks : 0;
      autoScore += answer.marksAwarded;
    }
  });

  return autoScore;
};

/**
 * Method to calculate total awarded marks
 * @returns {number} Total marks awarded
 */
submissionSchema.methods.calculateTotalMarks = function () {
  return this.answers.reduce((sum, answer) => sum + (answer.marksAwarded || 0), 0);
};

/**
 * Method to get answered question count
 * @returns {number} Number of answered questions
 */
submissionSchema.methods.getAnsweredCount = function () {
  return this.answers.filter(
    (answer) => answer.answer !== null && answer.answer !== undefined && answer.answer !== ''
  ).length;
};

/**
 * Virtual for calculating time taken (in minutes)
 */
submissionSchema.virtual('timeTaken').get(function () {
  if (this.submittedAt && this.startedAt) {
    return Math.floor((this.submittedAt - this.startedAt) / (1000 * 60));
  }
  return 0;
});

// Indexes for better query performance
submissionSchema.index({ assessmentId: 1, studentId: 1 });
submissionSchema.index({ studentId: 1, status: 1 });
submissionSchema.index({ assessmentId: 1, status: 1 });
submissionSchema.index({ evaluatedBy: 1 });

// Ensure only one submission per student per assessment
submissionSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });

// Ensure virtuals are included in JSON
submissionSchema.set('toJSON', { virtuals: true });
submissionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Submission', submissionSchema);
