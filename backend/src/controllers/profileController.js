const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises;

/**
 * @desc    Get student profile
 * @route   GET /api/student/profile
 * @access  Private (Student only)
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      profile: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student profile
 * @route   PUT /api/student/profile
 * @access  Private (Student only)
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const allowedFields = [
      'name', 'dateOfBirth', 'gender', 'phone', 'bio',
      'studentId', 'instituteCode', 'department', 'yearSemester',
      'secondaryEmail', 'emergencyContactName', 'emergencyContactPhone',
      'address', 'socialLinks'
    ];

    // Filter out non-allowed fields
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload profile avatar
 * @route   POST /api/student/profile/avatar
 * @access  Private (Student only)
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userId = req.user._id;
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // Delete old avatar if exists
    const user = await User.findById(userId);
    if (user.profilePic && user.profilePic.startsWith('/uploads')) {
      const oldPath = path.join(__dirname, '../../', user.profilePic);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        console.log('Old avatar not found or already deleted');
      }
    }

    // Update user with new avatar
    user.profilePic = avatarPath;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarPath
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/student/profile/password
 * @access  Private (Student only)
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get activity log
 * @route   GET /api/student/profile/activity
 * @access  Private (Student only)
 */
exports.getActivity = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, from, to, page = 1, limit = 20 } = req.query;

    // TODO: Implement activity logging system
    // For now, return empty array
    const activities = [];

    res.status(200).json({
      success: true,
      activities,
      pagination: {
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active sessions
 * @route   GET /api/student/profile/sessions
 * @access  Private (Student only)
 */
exports.getSessions = async (req, res, next) => {
  try {
    // TODO: Implement session tracking system
    // For now, return mock data
    const sessions = [
      {
        id: '1',
        device: 'Chrome on Windows',
        browser: 'Chrome 120',
        ip: req.ip,
        location: 'Unknown',
        lastActive: new Date(),
        isCurrent: true
      }
    ];

    res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Terminate session
 * @route   DELETE /api/student/profile/sessions/:id
 * @access  Private (Student only)
 */
exports.terminateSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Implement session termination
    res.status(200).json({
      success: true,
      message: 'Session terminated successfully'
    });
  } catch (error) {
    next(error);
  }
};
