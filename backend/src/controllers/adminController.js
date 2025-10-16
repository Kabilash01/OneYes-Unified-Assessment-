const User = require('../models/User');
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const mongoose = require('mongoose');

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

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    const recentAssessments = await Assessment.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdBy createdAt');

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
        },
        submissions: {
          total: totalSubmissions,
          byStatus: submissionsByStatus,
        },
        recentActivity: {
          users: recentUsers,
          assessments: recentAssessments,
        },
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

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      instituteCode,
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

    // Update fields
    if (name) user.name = name;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (instituteCode) user.instituteCode = instituteCode;
    if (profilePic) user.profilePic = profilePic;

    await user.save();

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

    res.status(200).json({
      success: true,
      message: 'User suspended successfully',
    });
  } catch (error) {
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

    if (status) {
      assessment.status = status;
    }

    await assessment.save();

    // Log the action (in a real app, you'd save this to a logs collection)
    console.log(`Admin ${req.user.email} flagged assessment ${id}. Reason: ${reason}`);

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
    const { type, page = 1, limit = 50 } = req.query;

    // In a production app, you'd have a separate Logs collection
    // For now, we'll return recent activities from different collections

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role createdAt');

    const recentAssessments = await Assessment.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentSubmissions = await Submission.find()
      .populate('studentId', 'name email')
      .populate('assessmentId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        logs: {
          users: recentUsers,
          assessments: recentAssessments,
          submissions: recentSubmissions,
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
    const { platformName, logo, primaryColor, secondaryColor } = req.body;

    // In a production app, you'd save these to a Settings collection
    // For now, we'll just return success

    res.status(200).json({
      success: true,
      message: 'Branding updated successfully',
      data: {
        platformName,
        logo,
        primaryColor,
        secondaryColor,
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

    res.status(200).json({
      success: true,
      message: 'Old data archived successfully',
      data: {
        archivedAssessments: archivedAssessments.modifiedCount,
        cutoffDate,
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
};
