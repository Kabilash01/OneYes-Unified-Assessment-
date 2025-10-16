const express = require('express');
const router = express.Router();
const {
  getAvailableAssessments,
  getAssessmentById,
  startAssessment,
  saveAnswer,
  submitAssessment,
  getSubmissions,
  getSubmissionById,
  getDashboardStats,
  getAssessmentCalendar,
  getInstructors,
} = require('../controllers/studentController');
const {
  getDashboardStats: getNewDashboardStats,
  getPerformanceTrend,
  getUpcomingAssessments,
  getRecentActivity,
} = require('../controllers/studentDashboardController');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getActivity,
  getSessions,
  terminateSession,
} = require('../controllers/profileController');
const {
  getSettings,
  updateGeneralSettings,
  updateNotificationSettings,
  updateAppearanceSettings,
  updatePrivacySettings,
  updateAccessibilitySettings,
} = require('../controllers/settingsController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const { objectIdValidation, paginationValidation } = require('../utils/validators');

// All student routes require authentication and student role
router.use(authMiddleware);
router.use(roleMiddleware('student'));

/**
 * @route   GET /api/student/dashboard/stats
 * @desc    Get student dashboard statistics
 * @access  Private (Student)
 */
router.get('/dashboard/stats', getNewDashboardStats);

/**
 * @route   GET /api/student/dashboard/performance-trend
 * @desc    Get performance trend for last 6 months
 * @access  Private (Student)
 */
router.get('/dashboard/performance-trend', getPerformanceTrend);

/**
 * @route   GET /api/student/dashboard/upcoming-assessments
 * @desc    Get upcoming assessments
 * @access  Private (Student)
 */
router.get('/dashboard/upcoming-assessments', getUpcomingAssessments);

/**
 * @route   GET /api/student/dashboard/recent-activity
 * @desc    Get recent activity
 * @access  Private (Student)
 */
router.get('/dashboard/recent-activity', getRecentActivity);

/**
 * @route   GET /api/student/assessments
 * @desc    Get available assessments
 * @access  Private (Student)
 */
router.get('/assessments', paginationValidation, getAvailableAssessments);

/**
 * @route   GET /api/student/assessments/calendar
 * @desc    Get assessments for calendar view
 * @access  Private (Student)
 */
router.get('/assessments/calendar', getAssessmentCalendar);

/**
 * @route   GET /api/student/instructors
 * @desc    Get list of instructors for filtering
 * @access  Private (Student)
 */
router.get('/instructors', getInstructors);

/**
 * @route   GET /api/student/assessments/:id
 * @desc    Get specific assessment details
 * @access  Private (Student)
 */
router.get('/assessments/:id', objectIdValidation('id'), getAssessmentById);

/**
 * @route   POST /api/student/assessments/:id/start
 * @desc    Start an assessment
 * @access  Private (Student)
 */
router.post('/assessments/:id/start', objectIdValidation('id'), startAssessment);

/**
 * @route   PUT /api/student/submissions/:id/answer
 * @desc    Save/update answer
 * @access  Private (Student)
 */
router.put('/submissions/:id/answer', objectIdValidation('id'), saveAnswer);

/**
 * @route   POST /api/student/submissions/:id/submit
 * @desc    Submit assessment
 * @access  Private (Student)
 */
router.post('/submissions/:id/submit', objectIdValidation('id'), submitAssessment);

/**
 * @route   GET /api/student/submissions
 * @desc    Get all submissions
 * @access  Private (Student)
 */
router.get('/submissions', paginationValidation, getSubmissions);

/**
 * @route   GET /api/student/submissions/:id
 * @desc    Get submission details
 * @access  Private (Student)
 */
router.get('/submissions/:id', objectIdValidation('id'), getSubmissionById);

// ============================================
// NOTIFICATION ROUTES
// ============================================

/**
 * @route   GET /api/student/notifications
 * @desc    Get all notifications
 * @access  Private (Student)
 */
router.get('/notifications', getNotifications);

/**
 * @route   GET /api/student/notifications/count
 * @desc    Get unread notification count
 * @access  Private (Student)
 */
router.get('/notifications/count', getUnreadCount);

/**
 * @route   PUT /api/student/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private (Student)
 */
router.put('/notifications/:id/read', objectIdValidation('id'), markAsRead);

/**
 * @route   PUT /api/student/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private (Student)
 */
router.put('/notifications/mark-all-read', markAllAsRead);

/**
 * @route   DELETE /api/student/notifications/:id
 * @desc    Delete notification
 * @access  Private (Student)
 */
router.delete('/notifications/:id', objectIdValidation('id'), deleteNotification);

// ============================================
// PROFILE ROUTES
// ============================================

/**
 * @route   GET /api/student/profile
 * @desc    Get student profile
 * @access  Private (Student)
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/student/profile
 * @desc    Update student profile
 * @access  Private (Student)
 */
router.put('/profile', updateProfile);

/**
 * @route   POST /api/student/profile/avatar
 * @desc    Upload profile avatar
 * @access  Private (Student)
 */
router.post(
  '/profile/avatar',
  uploadMiddleware.single('avatar'),
  uploadAvatar
);

/**
 * @route   PUT /api/student/profile/password
 * @desc    Change password
 * @access  Private (Student)
 */
router.put('/profile/password', changePassword);

/**
 * @route   GET /api/student/profile/activity
 * @desc    Get activity log
 * @access  Private (Student)
 */
router.get('/profile/activity', getActivity);

/**
 * @route   GET /api/student/profile/sessions
 * @desc    Get active sessions
 * @access  Private (Student)
 */
router.get('/profile/sessions', getSessions);

/**
 * @route   DELETE /api/student/profile/sessions/:id
 * @desc    Terminate session
 * @access  Private (Student)
 */
router.delete('/profile/sessions/:id', terminateSession);

// ============================================
// SETTINGS ROUTES
// ============================================

/**
 * @route   GET /api/student/settings
 * @desc    Get all settings
 * @access  Private (Student)
 */
router.get('/settings', getSettings);

/**
 * @route   PUT /api/student/settings/general
 * @desc    Update general settings
 * @access  Private (Student)
 */
router.put('/settings/general', updateGeneralSettings);

/**
 * @route   PUT /api/student/settings/notifications
 * @desc    Update notification settings
 * @access  Private (Student)
 */
router.put('/settings/notifications', updateNotificationSettings);

/**
 * @route   PUT /api/student/settings/appearance
 * @desc    Update appearance settings
 * @access  Private (Student)
 */
router.put('/settings/appearance', updateAppearanceSettings);

/**
 * @route   PUT /api/student/settings/privacy
 * @desc    Update privacy settings
 * @access  Private (Student)
 */
router.put('/settings/privacy', updatePrivacySettings);

/**
 * @route   PUT /api/student/settings/accessibility
 * @desc    Update accessibility settings
 * @access  Private (Student)
 */
router.put('/settings/accessibility', updateAccessibilitySettings);

module.exports = router;
