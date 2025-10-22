const User = require('../models/User');
const Assessment = require('../models/Assessment');
const Announcement = require('../models/Announcement');
const ActivityLog = require('../models/ActivityLog');

/**
 * @route   GET /api/search
 * @desc    Global search across multiple entities
 * @access  Private
 */
const globalSearch = async (req, res, next) => {
  try {
    const { query, type, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchRegex = new RegExp(query, 'i');
    const limitNum = Math.min(parseInt(limit), 50); // Max 50 results per type
    const results = {
      users: [],
      assessments: [],
      announcements: [],
      activityLogs: []
    };

    // Search Users (if admin)
    if ((type === 'all' || type === 'users') && req.user.role === 'admin') {
      results.users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { instituteCode: searchRegex }
        ]
      })
        .select('name email role instituteCode isActive createdAt')
        .limit(limitNum)
        .lean();
    }

    // Search Assessments
    if (type === 'all' || type === 'assessments') {
      const assessmentQuery = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { subject: searchRegex }
        ]
      };

      // Students see only published assessments
      if (req.user.role === 'student') {
        assessmentQuery.isPublished = true;
        assessmentQuery.status = 'active';
      }

      results.assessments = await Assessment.find(assessmentQuery)
        .select('title description subject duration totalMarks isPublished status createdAt createdBy')
        .populate('createdBy', 'name')
        .limit(limitNum)
        .lean();
    }

    // Search Announcements
    if (type === 'all' || type === 'announcements') {
      const now = new Date();
      const announcementQuery = {
        $or: [
          { title: searchRegex },
          { message: searchRegex }
        ],
        isActive: true,
        publishDate: { $lte: now }
      };

      // Filter by user role
      if (req.user.role !== 'admin') {
        announcementQuery.$and = [
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
        ];
      }

      results.announcements = await Announcement.find(announcementQuery)
        .select('title message priority targetAudience publishDate isPinned createdAt createdBy')
        .populate('createdBy', 'name')
        .limit(limitNum)
        .lean();
    }

    // Search Activity Logs (admin only)
    if ((type === 'all' || type === 'logs') && req.user.role === 'admin') {
      results.activityLogs = await ActivityLog.find({
        $or: [
          { action: searchRegex },
          { details: searchRegex },
          { ipAddress: searchRegex }
        ]
      })
        .select('action details userId ipAddress createdAt')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .lean();
    }

    // Calculate total results
    const totalResults = 
      results.users.length +
      results.assessments.length +
      results.announcements.length +
      results.activityLogs.length;

    res.status(200).json({
      success: true,
      data: {
        query,
        totalResults,
        results
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/search/suggestions
 * @desc    Get search suggestions based on partial query
 * @access  Private
 */
const getSearchSuggestions = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(200).json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const searchRegex = new RegExp('^' + query, 'i'); // Starts with query
    const suggestions = [];

    // Get user name suggestions (admin only)
    if (req.user.role === 'admin') {
      const users = await User.find({ name: searchRegex })
        .select('name')
        .limit(5)
        .lean();
      suggestions.push(...users.map(u => ({ text: u.name, type: 'user' })));
    }

    // Get assessment title suggestions
    const assessments = await Assessment.find({ 
      title: searchRegex,
      ...(req.user.role === 'student' && { isPublished: true, status: 'active' })
    })
      .select('title')
      .limit(5)
      .lean();
    suggestions.push(...assessments.map(a => ({ text: a.title, type: 'assessment' })));

    // Get announcement title suggestions
    const announcements = await Announcement.find({ 
      title: searchRegex,
      isActive: true
    })
      .select('title')
      .limit(5)
      .lean();
    suggestions.push(...announcements.map(a => ({ text: a.title, type: 'announcement' })));

    // Remove duplicates and limit to 10
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(s => [s.text, s])).values()
    ).slice(0, 10);

    res.status(200).json({
      success: true,
      data: { suggestions: uniqueSuggestions }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/search/recent
 * @desc    Get recent searches for current user
 * @access  Private
 */
const getRecentSearches = async (req, res, next) => {
  try {
    // For now, return empty array (could implement search history storage later)
    res.status(200).json({
      success: true,
      data: { recentSearches: [] }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch,
  getSearchSuggestions,
  getRecentSearches
};
