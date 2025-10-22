const mongoose = require('mongoose');

/**
 * Platform Settings Schema
 * @description Schema for global platform configuration and branding
 * This is a singleton schema - only one document should exist
 */
const platformSettingsSchema = new mongoose.Schema(
  {
    // Branding
    instituteName: {
      type: String,
      required: [true, 'Institute name is required'],
      trim: true,
      default: 'OneYes Assessment Platform',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    faviconUrl: {
      type: String,
      default: '',
    },
    primaryColor: {
      type: String,
      default: '#5B5FEF',
      match: [/^#[0-9A-F]{6}$/i, 'Invalid color format'],
    },
    secondaryColor: {
      type: String,
      default: '#FFA500',
      match: [/^#[0-9A-F]{6}$/i, 'Invalid color format'],
    },
    accentColor: {
      type: String,
      default: '#10B981',
      match: [/^#[0-9A-F]{6}$/i, 'Invalid color format'],
    },

    // Contact Information
    supportEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },

    // System Configuration
    systemConfig: {
      maxFileUploadSize: {
        type: Number,
        default: 5242880, // 5MB in bytes
      },
      allowedFileTypes: {
        type: [String],
        default: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      },
      sessionTimeout: {
        type: Number,
        default: 3600, // 1 hour in seconds
      },
      defaultLanguage: {
        type: String,
        default: 'en',
      },
      enableRegistration: {
        type: Boolean,
        default: true,
      },
      requireEmailVerification: {
        type: Boolean,
        default: false,
      },
      enableMaintenanceMode: {
        type: Boolean,
        default: false,
      },
      maintenanceMessage: {
        type: String,
        default: 'System is currently under maintenance. Please check back later.',
      },
    },

    // Assessment Settings
    assessmentDefaults: {
      defaultDuration: {
        type: Number,
        default: 60, // minutes
      },
      autoSaveInterval: {
        type: Number,
        default: 30, // seconds
      },
      showResultsImmediately: {
        type: Boolean,
        default: false,
      },
      allowReviewAfterSubmission: {
        type: Boolean,
        default: true,
      },
      preventTabSwitch: {
        type: Boolean,
        default: false,
      },
      maxTabSwitches: {
        type: Number,
        default: 3,
      },
    },

    // Security Settings
    security: {
      enableTwoFactorAuth: {
        type: Boolean,
        default: false,
      },
      passwordMinLength: {
        type: Number,
        default: 6,
      },
      passwordRequireSpecialChar: {
        type: Boolean,
        default: false,
      },
      passwordRequireNumber: {
        type: Boolean,
        default: false,
      },
      passwordRequireUppercase: {
        type: Boolean,
        default: false,
      },
      maxLoginAttempts: {
        type: Number,
        default: 5,
      },
      lockoutDuration: {
        type: Number,
        default: 900, // 15 minutes in seconds
      },
    },

    // Email Settings
    emailConfig: {
      smtpHost: String,
      smtpPort: Number,
      smtpUser: String,
      smtpPassword: String,
      fromEmail: String,
      fromName: String,
    },

    // Data Retention
    dataRetention: {
      logRetentionDays: {
        type: Number,
        default: 180, // 6 months
      },
      archivedAssessmentRetentionDays: {
        type: Number,
        default: 365, // 1 year
      },
      inactiveUserDays: {
        type: Number,
        default: 730, // 2 years
      },
    },

    // Features
    features: {
      enableNotifications: {
        type: Boolean,
        default: true,
      },
      enableAnalytics: {
        type: Boolean,
        default: true,
      },
      enableFileUploads: {
        type: Boolean,
        default: true,
      },
      enableBulkOperations: {
        type: Boolean,
        default: true,
      },
      enableExports: {
        type: Boolean,
        default: true,
      },
    },

    // Social Links
    socialLinks: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
      website: String,
    },

    // Last updated by
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Static method to get or create settings
 * Ensures only one settings document exists
 */
platformSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  
  if (!settings) {
    settings = await this.create({});
  }
  
  return settings;
};

/**
 * Static method to update settings
 * @param {Object} updates - Settings to update
 * @param {String} userId - ID of user making the update
 */
platformSettingsSchema.statics.updateSettings = async function (updates, userId) {
  const settings = await this.getSettings();
  
  Object.assign(settings, updates);
  settings.lastUpdatedBy = userId;
  
  return await settings.save();
};

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
