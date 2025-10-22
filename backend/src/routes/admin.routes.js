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
  getBranding,
  exportLogs,
  getSuspiciousAlerts,
  bulkImportUsers,
} = require('../controllers/adminController');
const {
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  deleteAdminNotification,
  clearAllAdminReadNotifications
} = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  registerValidation,
  objectIdValidation,
  paginationValidation,
} = require('../utils/validators');
const { logAdmin } = require('../middlewares/activityLogger');
const { uploadBrandingImages } = require('../middlewares/multerConfig');
const multer = require('multer');
const path = require('path');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get platform-wide statistics
 * @access  Private (Admin)
 */
router.get('/dashboard/stats', logAdmin('admin_dashboard_viewed'), getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/users', paginationValidation, logAdmin('users_list_viewed'), getUsers);

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private (Admin)
 */
router.post('/users', registerValidation, logAdmin('user_created'), createUser);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/users/:id', objectIdValidation('id'), logAdmin('user_updated'), updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete/suspend user
 * @access  Private (Admin)
 */
router.delete('/users/:id', objectIdValidation('id'), logAdmin('user_deleted'), deleteUser);

/**
 * @route   GET /api/admin/assessments
 * @desc    Get all assessments
 * @access  Private (Admin)
 */
router.get('/assessments', paginationValidation, logAdmin('assessments_list_viewed'), getAllAssessments);

/**
 * @route   PUT /api/admin/assessments/:id/flag
 * @desc    Flag or archive assessment
 * @access  Private (Admin)
 */
router.put('/assessments/:id/flag', objectIdValidation('id'), logAdmin('assessment_flagged'), flagAssessment);

/**
 * @route   GET /api/admin/logs
 * @desc    Get activity logs
 * @access  Private (Admin)
 */
router.get('/logs', paginationValidation, logAdmin('logs_viewed'), getLogs);

/**
 * @route   GET /api/admin/logs/export
 * @desc    Export activity logs as CSV
 * @access  Private (Admin)
 */
router.get('/logs/export', logAdmin('logs_exported'), exportLogs);

/**
 * @route   GET /api/admin/settings/branding
 * @desc    Get platform branding settings
 * @access  Private (Admin)
 */
router.get('/settings/branding', logAdmin('branding_viewed'), getBranding);

/**
 * @route   PUT /api/admin/settings/branding
 * @desc    Update platform branding (with file upload)
 * @access  Private (Admin)
 */
router.put(
  '/settings/branding',
  uploadBrandingImages,
  logAdmin('branding_updated'),
  updateBranding
);

/**
 * @route   POST /api/admin/settings/reset
 * @desc    Archive old data
 * @access  Private (Admin)
 */
router.post('/settings/reset', logAdmin('data_archived'), archiveOldData);

/**
 * @route   GET /api/admin/alerts
 * @desc    Get suspicious activity alerts
 * @access  Private (Admin)
 */
router.get('/alerts', logAdmin('alerts_viewed'), getSuspiciousAlerts);

/**
 * NOTIFICATION ROUTES
 */

/**
 * @route   GET /api/admin/notifications
 * @desc    Get all notifications for admin
 * @access  Private (Admin)
 */
router.get('/notifications', getAdminNotifications);

/**
 * @route   GET /api/admin/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private (Admin)
 */
router.get('/notifications/unread-count', getAdminUnreadCount);

/**
 * @route   PATCH /api/admin/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private (Admin)
 */
router.patch('/notifications/mark-all-read', markAllAdminNotificationsAsRead);

/**
 * @route   PATCH /api/admin/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private (Admin)
 */
router.patch('/notifications/:id/read', objectIdValidation('id'), markAdminNotificationAsRead);

/**
 * @route   DELETE /api/admin/notifications/clear-all
 * @desc    Clear all read notifications
 * @access  Private (Admin)
 */
router.delete('/notifications/clear-all', clearAllAdminReadNotifications);

/**
 * @route   DELETE /api/admin/notifications/:id
 * @desc    Delete notification
 * @access  Private (Admin)
 */
router.delete('/notifications/:id', objectIdValidation('id'), deleteAdminNotification);

/**
 * @route   POST /api/admin/users/bulk-import
 * @desc    Import users from CSV file (multipart/form-data, field name: file)
 * @access  Private (Admin)
 */
// small multer instance for CSV uploads
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/temp')),
  filename: (req, file, cb) => cb(null, `bulk_users_${Date.now()}${path.extname(file.originalname)}`),
});
const csvUpload = multer({
  storage: csvStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

router.post('/users/bulk-import', csvUpload.single('file'), logAdmin('users_bulk_import'), bulkImportUsers);

module.exports = router;
