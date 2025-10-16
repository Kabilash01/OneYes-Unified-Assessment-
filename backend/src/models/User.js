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
    // Profile fields
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    },
    phone: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    studentId: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    yearSemester: {
      type: String,
      trim: true,
    },
    enrollmentDate: {
      type: Date,
    },
    secondaryEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    emergencyContactName: {
      type: String,
      trim: true,
    },
    emergencyContactPhone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
    },
    // Settings fields
    settings: {
      language: {
        type: String,
        default: 'en',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      dateFormat: {
        type: String,
        default: 'MM/DD/YYYY',
      },
      timeFormat: {
        type: String,
        enum: ['12h', '24h'],
        default: '12h',
      },
      assessmentView: {
        type: String,
        enum: ['grid', 'list'],
        default: 'grid',
      },
      itemsPerPage: {
        type: Number,
        default: 9,
      },
      defaultSort: {
        type: String,
        default: 'recent',
      },
      autoSave: {
        enabled: {
          type: Boolean,
          default: true,
        },
        interval: {
          type: Number,
          default: 30, // seconds
        },
        showNotifications: {
          type: Boolean,
          default: true,
        },
      },
      notifications: {
        email: {
          newAssessment: {
            type: Boolean,
            default: true,
          },
          submissionEvaluated: {
            type: Boolean,
            default: true,
          },
          upcomingReminder: {
            type: Boolean,
            default: true,
          },
          deadlineReminder: {
            type: Boolean,
            default: true,
          },
          achievementUnlocked: {
            type: Boolean,
            default: true,
          },
          weeklySummary: {
            type: Boolean,
            default: true,
          },
        },
        browser: {
          enabled: {
            type: Boolean,
            default: true,
          },
          sound: {
            type: String,
            default: 'default',
          },
          desktop: {
            type: Boolean,
            default: true,
          },
        },
        inApp: {
          showBadge: {
            type: Boolean,
            default: true,
          },
          autoMarkRead: {
            type: Boolean,
            default: false,
          },
          position: {
            type: String,
            default: 'top-right',
          },
        },
        digestMode: {
          type: Boolean,
          default: false,
        },
        quietHours: {
          enabled: {
            type: Boolean,
            default: false,
          },
          start: String,
          end: String,
        },
      },
      appearance: {
        theme: {
          type: String,
          enum: ['light', 'dark', 'auto'],
          default: 'light',
        },
        primaryColor: {
          type: String,
          default: '#5B5FEF',
        },
        fontSize: {
          type: String,
          enum: ['small', 'medium', 'large', 'extra-large'],
          default: 'medium',
        },
        layoutDensity: {
          type: String,
          enum: ['comfortable', 'compact', 'spacious'],
          default: 'comfortable',
        },
        sidebarPosition: {
          type: String,
          enum: ['left', 'right'],
          default: 'left',
        },
        sidebarDefaultState: {
          type: String,
          enum: ['expanded', 'collapsed'],
          default: 'expanded',
        },
        dashboardCustomization: {
          showWelcomeBanner: {
            type: Boolean,
            default: true,
          },
          showQuickActions: {
            type: Boolean,
            default: true,
          },
          showRecentActivity: {
            type: Boolean,
            default: true,
          },
          defaultTab: {
            type: String,
            default: 'overview',
          },
        },
      },
      privacy: {
        profileVisibility: {
          type: String,
          enum: ['everyone', 'instructors-only', 'no-one'],
          default: 'instructors-only',
        },
        showActivityStatus: {
          type: Boolean,
          default: true,
        },
        sharePerformance: {
          type: Boolean,
          default: true,
        },
        allowAnalytics: {
          type: Boolean,
          default: true,
        },
        allowTracking: {
          type: Boolean,
          default: true,
        },
        allowRecommendations: {
          type: Boolean,
          default: true,
        },
      },
      accessibility: {
        highContrast: {
          type: Boolean,
          default: false,
        },
        reduceMotion: {
          type: Boolean,
          default: false,
        },
        largeCursor: {
          type: Boolean,
          default: false,
        },
        focusIndicators: {
          type: Boolean,
          default: true,
        },
        screenReaderOptimized: {
          type: Boolean,
          default: false,
        },
        readNotificationsAloud: {
          type: Boolean,
          default: false,
        },
        keyboardShortcuts: {
          type: Boolean,
          default: true,
        },
        showShortcutHints: {
          type: Boolean,
          default: true,
        },
        dyslexiaFriendlyFont: {
          type: Boolean,
          default: false,
        },
        lineHeight: {
          type: Number,
          default: 1.5,
        },
        letterSpacing: {
          type: Number,
          default: 0,
        },
      },
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
