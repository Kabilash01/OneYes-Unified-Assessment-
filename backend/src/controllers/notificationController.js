const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all notifications for logged-in student
 * @route   GET /api/student/notifications
 * @access  Private (Student only)
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const { unread, limit = 20, page = 1 } = req.query;
    const userId = req.user._id;

    // Build query
    const query = { userId };
    if (unread === 'true') {
      query.isRead = false;
    }

    // Pagination
    const skip = (page - 1) * parseInt(limit);
    const total = await Notification.countDocuments(query);

    // Fetch notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/student/notifications/count
 * @access  Private (Student only)
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const count = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/student/notifications/:id/read
 * @access  Private (Student only)
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/student/notifications/mark-all-read
 * @access  Private (Student only)
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/student/notifications/:id
 * @access  Private (Student only)
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to create notifications
 * Can be called from other controllers
 */
exports.createNotification = async (userId, data) => {
  try {
    return await Notification.createNotification({
      userId,
      ...data
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
