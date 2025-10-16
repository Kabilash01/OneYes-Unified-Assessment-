const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  registerValidation,
  objectIdValidation,
  paginationValidation,
} = require('../utils/validators');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get platform-wide statistics
 * @access  Private (Admin)
 */
router.get('/dashboard/stats', getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/users', paginationValidation, getUsers);

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private (Admin)
 */
router.post('/users', registerValidation, createUser);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/users/:id', objectIdValidation('id'), updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete/suspend user
 * @access  Private (Admin)
 */
router.delete('/users/:id', objectIdValidation('id'), deleteUser);

/**
 * @route   GET /api/admin/assessments
 * @desc    Get all assessments
 * @access  Private (Admin)
 */
router.get('/assessments', paginationValidation, getAllAssessments);

/**
 * @route   PUT /api/admin/assessments/:id/flag
 * @desc    Flag or archive assessment
 * @access  Private (Admin)
 */
router.put('/assessments/:id/flag', objectIdValidation('id'), flagAssessment);

/**
 * @route   GET /api/admin/logs
 * @desc    Get activity logs
 * @access  Private (Admin)
 */
router.get('/logs', paginationValidation, getLogs);

/**
 * @route   PUT /api/admin/settings/branding
 * @desc    Update platform branding
 * @access  Private (Admin)
 */
router.put('/settings/branding', updateBranding);

/**
 * @route   POST /api/admin/settings/reset
 * @desc    Archive old data
 * @access  Private (Admin)
 */
router.post('/settings/reset', archiveOldData);

module.exports = router;
