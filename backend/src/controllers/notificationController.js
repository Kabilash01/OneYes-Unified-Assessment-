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
      recipientId: userId, // Support both fields
      ...data
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * @desc    Get all notifications for admin
 * @route   GET /api/admin/notifications
 * @access  Private (Admin only)
 */
exports.getAdminNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const recipientId = req.user._id;

    // Build filter
    const filter = { $or: [{ recipientId }, { userId: recipientId }] };
    
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.isRead !== undefined) {
      filter.isRead = req.query.isRead === 'true';
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread count for admin
 * @route   GET /api/admin/notifications/unread-count
 * @access  Private (Admin only)
 */
exports.getAdminUnreadCount = async (req, res, next) => {
  try {
    const recipientId = req.user._id;
    const unreadCount = await Notification.countDocuments({
      $or: [{ recipientId }, { userId: recipientId }],
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark notification as read (admin)
 * @route   PATCH /api/admin/notifications/:id/read
 * @access  Private (Admin only)
 */
exports.markAdminNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipientId = req.user._id;

    const notification = await Notification.findOne({
      _id: id,
      $or: [{ recipientId }, { userId: recipientId }]
    });

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
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read (admin)
 * @route   PATCH /api/admin/notifications/mark-all-read
 * @access  Private (Admin only)
 */
exports.markAllAdminNotificationsAsRead = async (req, res, next) => {
  try {
    const recipientId = req.user._id;
    
    const result = await Notification.updateMany(
      {
        $or: [{ recipientId }, { userId: recipientId }],
        isRead: false
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete notification (admin)
 * @route   DELETE /api/admin/notifications/:id
 * @access  Private (Admin only)
 */
exports.deleteAdminNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipientId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      $or: [{ recipientId }, { userId: recipientId }]
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear all read notifications (admin)
 * @route   DELETE /api/admin/notifications/clear-all
 * @access  Private (Admin only)
 */
exports.clearAllAdminReadNotifications = async (req, res, next) => {
  try {
    const recipientId = req.user._id;

    const result = await Notification.deleteMany({
      $or: [{ recipientId }, { userId: recipientId }],
      isRead: true
    });

    res.status(200).json({
      success: true,
      message: 'All read notifications cleared',
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    next(error);
  }
};
