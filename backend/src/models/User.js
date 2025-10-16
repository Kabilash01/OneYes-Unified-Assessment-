const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * @description Schema for all user types (students, instructors, admins)
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'instructor', 'admin'],
        message: 'Role must be either student, instructor, or admin',
      },
      default: 'student',
    },
    instituteCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    profilePic: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password before saving
 */
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} True if password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Method to get public profile
 * @returns {Object} User object without sensitive data
 */
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    instituteCode: this.instituteCode,
    profilePic: this.profilePic,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model('User', userSchema);
