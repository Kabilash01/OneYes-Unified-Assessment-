const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementStats
} = require('../controllers/announcementController');
const { adminAuth } = require('../middlewares/adminAuth');

/**
 * @route   POST /api/admin/announcements
 * @desc    Create new announcement
 * @access  Admin
 */
router.post('/', adminAuth, createAnnouncement);

/**
 * @route   GET /api/admin/announcements
 * @desc    Get all announcements (admin view with filters)
 * @access  Admin
 */
router.get('/', adminAuth, getAllAnnouncements);

/**
 * @route   GET /api/admin/announcements/stats
 * @desc    Get announcement statistics
 * @access  Admin
 */
router.get('/stats', adminAuth, getAnnouncementStats);

/**
 * @route   GET /api/admin/announcements/:id
 * @desc    Get single announcement by ID
 * @access  Admin
 */
router.get('/:id', adminAuth, getAnnouncementById);

/**
 * @route   PUT /api/admin/announcements/:id
 * @desc    Update announcement
 * @access  Admin
 */
router.put('/:id', adminAuth, updateAnnouncement);

/**
 * @route   DELETE /api/admin/announcements/:id
 * @desc    Delete announcement
 * @access  Admin
 */
router.delete('/:id', adminAuth, deleteAnnouncement);

module.exports = router;
