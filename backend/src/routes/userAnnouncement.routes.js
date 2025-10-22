const express = require('express');
const router = express.Router();
const {
  getUserAnnouncements,
  markAnnouncementAsViewed,
  getPinnedAnnouncements
} = require('../controllers/announcementController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/announcements
 * @desc    Get announcements for current user
 * @access  Private (All roles)
 */
router.get('/', authMiddleware, getUserAnnouncements);

/**
 * @route   GET /api/announcements/pinned
 * @desc    Get pinned announcements for current user
 * @access  Private
 */
router.get('/pinned', authMiddleware, getPinnedAnnouncements);

/**
 * @route   POST /api/announcements/:id/view
 * @desc    Mark announcement as viewed
 * @access  Private
 */
router.post('/:id/view', authMiddleware, markAnnouncementAsViewed);

module.exports = router;
