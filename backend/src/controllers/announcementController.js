const Announcement = require('../models/Announcement');
const User = require('../models/User');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

/**
 * @route   POST /api/admin/announcements
 * @desc    Create a new announcement
 * @access  Admin
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const {
      title,
      message,
      priority,
      targetAudience,
      targetUserIds,
      targetRoles,
      publishDate,
      expiryDate,
      isPinned,
      sendEmail,
      sendNotification,
      attachments
    } = req.body;

    // Create announcement
    const announcement = await Announcement.create({
      title,
      message,
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      targetUserIds,
      targetRoles,
      publishDate: publishDate || new Date(),
      expiryDate,
      isPinned: isPinned || false,
      sendEmail: sendEmail || false,
      sendNotification: sendNotification !== false, // Default to true
      attachments,
      createdBy: req.user._id
    });

    // Populate creator info
    await announcement.populate('createdBy', 'name email role');

    // Get target users
    let targetUsers = [];
    if (targetAudience === 'all') {
      targetUsers = await User.find({ isActive: true }).select('_id email name role');
    } else if (targetAudience === 'students' || targetAudience === 'instructors' || targetAudience === 'admins') {
      const role = targetAudience.slice(0, -1); // Remove 's' from end
      targetUsers = await User.find({ role, isActive: true }).select('_id email name role');
    } else if (targetAudience === 'custom' && targetUserIds && targetUserIds.length > 0) {
      targetUsers = await User.find({ _id: { $in: targetUserIds }, isActive: true }).select('_id email name role');
    }

    // Send notifications if enabled
    if (sendNotification && targetUsers.length > 0) {
      try {
        const userIds = targetUsers.map(u => u._id);
        await notificationService.createAnnouncementNotifications(
          announcement._id,
          title,
          userIds,
          priority
        );
        announcement.notificationSentCount = userIds.length;
        await announcement.save();
      } catch (notifError) {
        console.error('Failed to send notifications:', notifError);
      }
    }

    // Send emails if enabled
    if (sendEmail && targetUsers.length > 0) {
      try {
        const recipients = targetUsers.map(u => ({
          email: u.email,
          name: u.name
        }));
        
        await emailService.sendAnnouncementEmail(
          recipients,
          title,
          message,
          priority
        );
        
        announcement.emailSentCount = recipients.length;
        await announcement.save();
      } catch (emailError) {
        console.error('Failed to send announcement emails:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: { announcement }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/announcements
 * @desc    Get all announcements (admin view)
 * @access  Admin
 */
const getAllAnnouncements = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      priority,
      targetAudience,
      isActive,
      isPinned,
      search
    } = req.query;

    const query = {};

    // Filters
    if (priority) query.priority = priority;
    if (targetAudience) query.targetAudience = targetAudience;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isPinned !== undefined) query.isPinned = isPinned === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [announcements, totalCount] = await Promise.all([
      Announcement.find(query)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name email role')
        .lean(),
      Announcement.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        announcements,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/announcements/:id
 * @desc    Get single announcement by ID
 * @access  Admin
 */
const getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('targetUserIds', 'name email role')
      .lean();

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { announcement }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/announcements/:id
 * @desc    Update announcement
 * @access  Admin
 */
const updateAnnouncement = async (req, res, next) => {
  try {
    const {
      title,
      message,
      priority,
      targetAudience,
      targetUserIds,
      targetRoles,
      publishDate,
      expiryDate,
      isPinned,
      isActive,
      attachments
    } = req.body;

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Update fields
    if (title !== undefined) announcement.title = title;
    if (message !== undefined) announcement.message = message;
    if (priority !== undefined) announcement.priority = priority;
    if (targetAudience !== undefined) announcement.targetAudience = targetAudience;
    if (targetUserIds !== undefined) announcement.targetUserIds = targetUserIds;
    if (targetRoles !== undefined) announcement.targetRoles = targetRoles;
    if (publishDate !== undefined) announcement.publishDate = publishDate;
    if (expiryDate !== undefined) announcement.expiryDate = expiryDate;
    if (isPinned !== undefined) announcement.isPinned = isPinned;
    if (isActive !== undefined) announcement.isActive = isActive;
    if (attachments !== undefined) announcement.attachments = attachments;

    await announcement.save();
    await announcement.populate('createdBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: { announcement }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/announcements/:id
 * @desc    Delete announcement
 * @access  Admin
 */
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/announcements
 * @desc    Get announcements for current user
 * @access  Private (All roles)
 */
const getUserAnnouncements = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      priority,
      unreadOnly
    } = req.query;

    const now = new Date();
    const query = {
      isActive: true,
      publishDate: { $lte: now },
      $and: [
        {
          $or: [
            { expiryDate: { $exists: false } },
            { expiryDate: { $gte: now } }
          ]
        },
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: req.user.role + 's' },
            { targetUserIds: req.user._id }
          ]
        }
      ]
    };

    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let announcements = await Announcement.find(query)
      .sort({ isPinned: -1, publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .lean();

    // Filter unread if requested
    if (unreadOnly === 'true') {
      announcements = announcements.filter(
        ann => !ann.viewedBy.some(v => v.userId.toString() === req.user._id.toString())
      );
    }

    // Add viewed status
    announcements = announcements.map(ann => ({
      ...ann,
      hasViewed: ann.viewedBy.some(v => v.userId.toString() === req.user._id.toString())
    }));

    const totalCount = await Announcement.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        announcements,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/announcements/:id/view
 * @desc    Mark announcement as viewed
 * @access  Private
 */
const markAnnouncementAsViewed = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.incrementView(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Announcement marked as viewed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/announcements/pinned
 * @desc    Get pinned announcements for current user
 * @access  Private
 */
const getPinnedAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.getPinnedAnnouncements(req.user.role);

    res.status(200).json({
      success: true,
      data: { announcements }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/announcements/stats
 * @desc    Get announcement statistics
 * @access  Admin
 */
const getAnnouncementStats = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      totalAnnouncements,
      activeAnnouncements,
      pinnedAnnouncements,
      expiredAnnouncements,
      priorityStats
    ] = await Promise.all([
      Announcement.countDocuments(),
      Announcement.countDocuments({
        isActive: true,
        publishDate: { $lte: now },
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: { $gte: now } }
        ]
      }),
      Announcement.countDocuments({ isPinned: true, isActive: true }),
      Announcement.countDocuments({ expiryDate: { $lt: now } }),
      Announcement.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAnnouncements,
        activeAnnouncements,
        pinnedAnnouncements,
        expiredAnnouncements,
        priorityStats: priorityStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getUserAnnouncements,
  markAnnouncementAsViewed,
  getPinnedAnnouncements,
  getAnnouncementStats
};
