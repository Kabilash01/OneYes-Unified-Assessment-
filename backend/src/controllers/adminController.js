const User = require('../models/User');
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const ActivityLog = require('../models/ActivityLog');
const PlatformSettings = require('../models/PlatformSettings');
const mongoose = require('mongoose');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get platform-wide statistics
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const activeUsers = await User.countDocuments({ isActive: true });

    // Assessment statistics
    const totalAssessments = await Assessment.countDocuments();
    const assessmentsByStatus = await Assessment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const publishedAssessments = await Assessment.countDocuments({ status: 'published' });

    // Submission statistics
    const totalSubmissions = await Submission.countDocuments();
    const submissionsByStatus = await Submission.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const pendingEvaluations = await Submission.countDocuments({ status: 'submitted' });

    // Recent activity from ActivityLog
    const recentActivity = await ActivityLog.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('action userId createdAt details status');

    // Get monthly assessment data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const assessmentsByMonth = await Assessment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Get daily registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationsByDay = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Log dashboard access
    await ActivityLog.log({
      userId: req.user._id,
      action: 'admin_dashboard_viewed',
      details: { action: 'Viewed admin dashboard stats' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: usersByRole,
          active: activeUsers,
        },
        assessments: {
          total: totalAssessments,
          byStatus: assessmentsByStatus,
          published: publishedAssessments,
          byMonth: assessmentsByMonth,
        },
        submissions: {
          total: totalSubmissions,
          byStatus: submissionsByStatus,
          pendingEvaluations,
        },
        recentActivity,
        registrationsByDay,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (filterable by role)
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, search, isActive, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { instituteCode: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users: users.map((user) => user.toPublicJSON()),
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private (Admin)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, instituteCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Store the temporary password before hashing
    const temporaryPassword = password;

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      instituteCode,
    });

    // Send welcome email with credentials (async, don't wait)
    emailService.sendUserCreatedEmail(
      user.email,
      user.name,
      user.role,
      temporaryPassword
    ).catch(err => console.error('Failed to send welcome email:', err));

    // Create notification for all admins (async, don't wait)
    notificationService.createUserRegistrationNotification(user._id)
      .catch(err => console.error('Failed to create user registration notification:', err));

    // Log user creation
    await ActivityLog.log({
      userId: req.user._id,
      action: 'user_created',
      targetType: 'User',
      targetId: user._id,
      details: {
        createdUser: { name: user.name, email: user.email, role: user.role },
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user details or role
 * @access  Private (Admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, isActive, instituteCode, profilePic } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deactivating themselves
    if (id === req.user._id.toString() && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    // Track changes for logging
    const updatedFields = [];
    const beforeState = {};
    const afterState = {};

    // Update fields and track changes
    const previousIsActive = user.isActive;
    
    if (name && name !== user.name) {
      beforeState.name = user.name;
      user.name = name;
      afterState.name = name;
      updatedFields.push('name');
    }
    if (role && role !== user.role) {
      beforeState.role = user.role;
      user.role = role;
      afterState.role = role;
      updatedFields.push('role');
    }
    if (isActive !== undefined && isActive !== user.isActive) {
      beforeState.isActive = user.isActive;
      user.isActive = isActive;
      afterState.isActive = isActive;
      updatedFields.push('isActive');
    }
    if (instituteCode && instituteCode !== user.instituteCode) {
      beforeState.instituteCode = user.instituteCode;
      user.instituteCode = instituteCode;
      afterState.instituteCode = instituteCode;
      updatedFields.push('instituteCode');
    }
    if (profilePic && profilePic !== user.profilePic) {
      beforeState.profilePic = user.profilePic;
      user.profilePic = profilePic;
      afterState.profilePic = profilePic;
      updatedFields.push('profilePic');
    }

    await user.save();

    // Send email notifications for status changes
    if (isActive === false && previousIsActive === true) {
      // User was suspended
      const suspensionReason = req.body.reason || 'Policy violation';
      emailService.sendUserSuspendedEmail(
        user.email,
        user.name,
        suspensionReason
      ).catch(err => console.error('Failed to send suspension email:', err));
    } else if (isActive === true && previousIsActive === false) {
      // User was reactivated
      emailService.sendAccountReactivatedEmail(
        user.email,
        user.name
      ).catch(err => console.error('Failed to send reactivation email:', err));
    }

    // Log user update with change details
    if (updatedFields.length > 0) {
      await ActivityLog.log({
        userId: req.user._id,
        action: 'user_updated',
        targetType: 'User',
        targetId: user._id,
        details: {
          updatedUser: { name: user.name, email: user.email, role: user.role },
          updatedFields,
          beforeState,
          afterState,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'success',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete/suspend user
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Soft delete by deactivating
    user.isActive = false;
    await user.save();

    // Log user suspension
    await ActivityLog.log({
      userId: req.user._id,
      action: 'user_deleted',
      targetType: 'User',
      targetId: user._id,
      details: {
        suspendedUser: { name: user.name, email: user.email, role: user.role },
        reason: 'Admin suspended user account',
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.status(200).json({
      success: true,
      message: 'User suspended successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/users/bulk-import
 * @desc    Import users from uploaded CSV file
 * @access  Private (Admin)
 */
const bulkImportUsers = async (req, res, next) => {
  const fs = require('fs');
  const csv = require('fast-csv');
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const results = [];
    const errors = [];
    let successCount = 0;
    let failedCount = 0;

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv.parse({ headers: true, trim: true }))
        .on('error', (error) => reject(error))
        .on('data', (row) => results.push(row))
        .on('end', () => resolve())
    });

    // Validate and insert rows sequentially to handle duplicates gracefully
    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      const rowNumber = i + 2; // header + 1-based index

      const name = (row.name || '').trim();
      const email = (row.email || '').trim().toLowerCase();
      const password = (row.password || '').trim();
      const role = (row.role || 'student').trim().toLowerCase();
      const department = (row.department || '').trim() || undefined;

      // Basic validations
      const rowErrors = [];
      if (!name) rowErrors.push('Name is required');
      if (!email) rowErrors.push('Email is required');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) rowErrors.push('Invalid email format');
      if (!password || password.length < 6) rowErrors.push('Password must be at least 6 characters');
      if (!['student','instructor','admin'].includes(role)) rowErrors.push('Role must be student, instructor or admin');

      if (rowErrors.length > 0) {
        failedCount++;
        errors.push({ row: rowNumber, email: email || null, error: rowErrors.join('; ') });
        continue;
      }

      // Check duplicate email
      const existing = await User.findOne({ email });
      if (existing) {
        failedCount++;
        errors.push({ row: rowNumber, email, error: 'Email already exists' });
        continue;
      }

      try {
        const user = await User.create({
          name,
          email,
          password,
          role,
          department,
        });

        // Send welcome email asynchronously
        emailService.sendUserCreatedEmail(user.email, user.name, user.role, password).catch(err => console.error('Welcome email failed:', err));

        // Create admin notification (async)
        notificationService.createUserRegistrationNotification(user._id).catch(err => console.error('Notification creation failed:', err));

        successCount++;
      } catch (err) {
        failedCount++;
        errors.push({ row: rowNumber, email, error: err.message });
      }
    }

    // cleanup uploaded file
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }

    // Log activity
    await ActivityLog.log({
      userId: req.user._id,
      action: 'users_bulk_import',
      details: { successCount, failedCount },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.status(200).json({
      success: true,
      message: `Imported ${successCount} users, ${failedCount} failed`,
      successCount,
      failedCount,
      errors,
    });
  } catch (error) {
    // attempt to remove file
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    next(error);
  }
};

/**
 * @route   GET /api/admin/assessments
 * @desc    Get all assessments across platform
 * @access  Private (Admin)
 */
const getAllAssessments = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const assessments = await Assessment.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Assessment.countDocuments(query);

    // Get submission counts
    const assessmentsWithStats = await Promise.all(
      assessments.map(async (assessment) => {
        const submissionCount = await Submission.countDocuments({
          assessmentId: assessment._id,
        });

        return {
          ...assessment.toObject(),
          submissionCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        assessments: assessmentsWithStats,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/assessments/:id/flag
 * @desc    Flag or archive assessment
 * @access  Private (Admin)
 */
const flagAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
      });
    }

    const oldStatus = assessment.status;

    if (status) {
      assessment.status = status;
    }

    await assessment.save();

    // Log the assessment status change
    await ActivityLog.log({
      userId: req.user._id,
      action: 'assessment_updated',
      targetType: 'Assessment',
      targetId: assessment._id,
      details: {
        assessmentTitle: assessment.title,
        statusChange: { from: oldStatus, to: status },
        reason: reason || 'Admin flagged/archived assessment',
        adminEmail: req.user.email,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      data: { assessment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/logs
 * @desc    Get activity logs (filterable)
 * @access  Private (Admin)
 */
const getLogs = async (req, res, next) => {
  try {
    const {
      action,
      userId,
      status,
      startDate,
      endDate,
      targetType,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    // Build filter query
    const filter = {};

    if (action) {
      filter.action = action;
    }

    if (userId) {
      filter.userId = userId;
    }

    if (status) {
      filter.status = status;
    }

    if (targetType) {
      filter.targetType = targetType;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Search in details or ipAddress
    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch logs with filters
    const logs = await ActivityLog.find(filter)
      .populate('userId', 'name email role profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(filter);

    // Get unique action types for filter dropdown
    const actionTypes = await ActivityLog.distinct('action');

    res.status(200).json({
      success: true,
      data: {
        logs,
        actionTypes,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/settings/branding
 * @desc    Update platform branding
 * @access  Private (Admin)
 */
const updateBranding = async (req, res, next) => {
  try {
    const {
      instituteName,
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      bannerUrl,
    } = req.body;

    // Get current settings
    let settings = await PlatformSettings.getSettings();

    // Build update object (only include provided fields)
    const updates = {};

    if (instituteName) updates.instituteName = instituteName;
    if (logoUrl) updates.logoUrl = logoUrl;
    if (faviconUrl) updates.faviconUrl = faviconUrl;
    if (bannerUrl) updates.bannerUrl = bannerUrl;
    if (primaryColor) updates.primaryColor = primaryColor;
    if (secondaryColor) updates.secondaryColor = secondaryColor;
    if (accentColor) updates.accentColor = accentColor;

    // Handle file upload if present (from multer)
    if (req.file) {
      const fileUrl = `/uploads/branding/${req.file.filename}`;
      
      // Determine which field to update based on fieldname
      if (req.file.fieldname === 'logo') {
        updates.logoUrl = fileUrl;
      } else if (req.file.fieldname === 'favicon') {
        updates.faviconUrl = fileUrl;
      } else if (req.file.fieldname === 'banner') {
        updates.bannerUrl = fileUrl;
      }
    }

    // Handle multiple file uploads
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        updates.logoUrl = `/uploads/branding/logos/${req.files.logo[0].filename}`;
      }
      if (req.files.favicon && req.files.favicon[0]) {
        updates.faviconUrl = `/uploads/branding/favicon/${req.files.favicon[0].filename}`;
      }
      if (req.files.banner && req.files.banner[0]) {
        updates.bannerUrl = `/uploads/branding/banners/${req.files.banner[0].filename}`;
      }
    }

    // Update settings
    Object.assign(settings, updates);
    settings.lastUpdatedBy = req.user._id;
    await settings.save();

    // Log branding update
    await ActivityLog.log({
      userId: req.user._id,
      action: 'settings_updated',
      targetType: 'PlatformSettings',
      targetId: settings._id,
      details: {
        updatedFields: Object.keys(updates),
        updates,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    // Return branding data in a consistent format
    const brandingData = {
      instituteName: settings.instituteName,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      bannerUrl: settings.bannerUrl,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
    };

    res.status(200).json({
      success: true,
      message: 'Branding updated successfully',
      data: {
        branding: brandingData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/settings/reset
 * @desc    Archive old data
 * @access  Private (Admin)
 */
const archiveOldData = async (req, res, next) => {
  try {
    const { monthsOld = 12 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - parseInt(monthsOld));

    // Archive old assessments
    const archivedAssessments = await Assessment.updateMany(
      {
        status: 'published',
        endDate: { $lt: cutoffDate },
      },
      {
        $set: { status: 'archived' },
      }
    );

    // Archive old submissions (older than configured retention period)
    const settings = await PlatformSettings.getSettings();
    const submissionCutoff = new Date();
    submissionCutoff.setDate(
      submissionCutoff.getDate() - settings.dataRetention.archivedAssessmentRetentionDays
    );

    const archivedSubmissions = await Submission.updateMany(
      {
        status: { $in: ['evaluated', 'reviewed'] },
        updatedAt: { $lt: submissionCutoff },
      },
      {
        $set: { archived: true },
      }
    );

    // Optionally delete old logs based on retention policy
    const logCutoff = new Date();
    logCutoff.setDate(logCutoff.getDate() - settings.dataRetention.logRetentionDays);

    const deletedLogs = await ActivityLog.deleteMany({
      createdAt: { $lt: logCutoff },
      action: { $nin: ['user_created', 'user_deleted', 'assessment_created'] }, // Keep critical logs
    });

    // Log archive operation
    await ActivityLog.log({
      userId: req.user._id,
      action: 'data_archived',
      details: {
        monthsOld: parseInt(monthsOld),
        archivedCount: {
          assessments: archivedAssessments.modifiedCount,
          submissions: archivedSubmissions.modifiedCount,
          logs: deletedLogs.deletedCount,
        },
        cutoffDate,
        submissionCutoff,
        logCutoff,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.status(200).json({
      success: true,
      message: 'Old data archived successfully',
      data: {
        archivedAssessments: archivedAssessments.modifiedCount,
        archivedSubmissions: archivedSubmissions.modifiedCount,
        deletedLogs: deletedLogs.deletedCount,
        cutoffDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/settings/branding
 * @desc    Get current platform branding settings
 * @access  Private (Admin)
 */
const getBranding = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.getSettings();

    // Return branding data in a consistent format
    const brandingData = {
      instituteName: settings.instituteName,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      bannerUrl: settings.bannerUrl,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
    };

    res.status(200).json({
      success: true,
      data: {
        branding: brandingData,
        system: settings.systemConfig,
        assessmentDefaults: settings.assessmentDefaults,
        features: settings.features,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/logs/export
 * @desc    Export activity logs as CSV
 * @access  Private (Admin)
 */
const exportLogs = async (req, res, next) => {
  try {
    const {
      action,
      userId,
      status,
      startDate,
      endDate,
      targetType,
    } = req.query;

    // Build filter query (same as getLogs)
    const filter = {};

    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (targetType) filter.targetType = targetType;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Fetch all matching logs (no pagination for export)
    const logs = await ActivityLog.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10000); // Safety limit

    // Convert to CSV format
    const csvRows = [
      // Header row
      'Timestamp,Action,User,Email,Role,Status,IP Address,Target Type,Target ID,Details',
    ];

    logs.forEach((log) => {
      const row = [
        new Date(log.createdAt).toISOString(),
        log.action,
        log.userId?.name || 'N/A',
        log.userId?.email || 'N/A',
        log.userId?.role || 'N/A',
        log.status,
        log.ipAddress || 'N/A',
        log.targetType || 'N/A',
        log.targetId || 'N/A',
        JSON.stringify(log.details).replace(/"/g, '""'), // Escape quotes
      ];
      csvRows.push(row.map((cell) => `"${cell}"`).join(','));
    });

    const csv = csvRows.join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="activity_logs_${Date.now()}.csv"`
    );

    // Log export action
    await ActivityLog.log({
      userId: req.user._id,
      action: 'logs_exported',
      details: {
        exportedCount: logs.length,
        filters: { action, userId, status, startDate, endDate, targetType },
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      status: 'success',
    });

    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/alerts
 * @desc    Get suspicious activity alerts
 * @access  Private (Admin)
 */
const getSuspiciousAlerts = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find multiple failed login attempts (5+ in 30 minutes)
    const failedLogins = await ActivityLog.aggregate([
      {
        $match: {
          action: 'login_failed',
          createdAt: { $gte: thirtyMinutesAgo },
        },
      },
      {
        $group: {
          _id: '$ipAddress',
          count: { $sum: 1 },
          userId: { $first: '$userId' },
          lastAttempt: { $max: '$createdAt' },
        },
      },
      {
        $match: { count: { $gte: 5 } },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Find rapid submissions from same student (10+ in 1 hour)
    const rapidSubmissions = await ActivityLog.aggregate([
      {
        $match: {
          action: 'submission_submitted',
          createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
          lastSubmission: { $max: '$createdAt' },
        },
      },
      {
        $match: { count: { $gte: 10 } },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Find users with multiple tab switches during assessment
    const tabSwitches = await ActivityLog.aggregate([
      {
        $match: {
          action: 'assessment_tab_switch',
          createdAt: { $gte: oneDayAgo },
        },
      },
      {
        $group: {
          _id: { userId: '$userId', targetId: '$targetId' },
          count: { $sum: 1 },
          lastSwitch: { $max: '$createdAt' },
          userId: { $first: '$userId' },
          assessmentId: { $first: '$targetId' },
        },
      },
      {
        $match: { count: { $gte: 5 } },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Populate user details
    const failedLoginsWithUsers = await User.populate(failedLogins, {
      path: 'userId',
      select: 'name email role',
    });

    const rapidSubmissionsWithUsers = await User.populate(rapidSubmissions, {
      path: '_id',
      select: 'name email role',
    });

    const tabSwitchesWithUsers = await User.populate(tabSwitches, {
      path: 'userId',
      select: 'name email role',
    });

    res.status(200).json({
      success: true,
      data: {
        alerts: {
          failedLogins: failedLoginsWithUsers,
          rapidSubmissions: rapidSubmissionsWithUsers,
          tabSwitches: tabSwitchesWithUsers,
        },
        summary: {
          totalAlerts:
            failedLogins.length +
            rapidSubmissions.length +
            tabSwitches.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllAssessments,
  flagAssessment,
  getLogs,
  updateBranding,
  archiveOldData,
  getBranding,
  exportLogs,
  getSuspiciousAlerts,
  bulkImportUsers,
};
