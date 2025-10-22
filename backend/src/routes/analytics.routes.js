const express = require('express');
const router = express.Router();
const {
  getStudentAnalytics,
  getStudentComparison,
  getInstructorAnalytics,
  getClassAnalytics,
  getAssessmentDifficulty,
  getPlatformAnalytics,
  getUserEngagement,
  generateReport,
  scheduleReport,
  getScheduledReports,
  deleteScheduledReport,
  emailReport
} = require('../controllers/analyticsController');

const { protect, authorize } = require('../middlewares/auth');

// ==================== STUDENT ROUTES ====================

// Get student analytics
router.get(
  '/student/:studentId',
  protect,
  authorize('student', 'instructor', 'admin'),
  getStudentAnalytics
);

// Get student comparison data for specific assessment
router.get(
  '/student/:studentId/comparison/:assessmentId',
  protect,
  authorize('student', 'instructor', 'admin'),
  getStudentComparison
);

// ==================== INSTRUCTOR ROUTES ====================

// Get instructor overview analytics
router.get(
  '/instructor/:instructorId',
  protect,
  authorize('instructor', 'admin'),
  getInstructorAnalytics
);

// Get class performance for specific assessment
router.get(
  '/class/:assessmentId',
  protect,
  authorize('instructor', 'admin'),
  getClassAnalytics
);

// Get assessment difficulty analysis
router.get(
  '/assessment/:assessmentId/difficulty',
  protect,
  authorize('instructor', 'admin'),
  getAssessmentDifficulty
);

// ==================== ADMIN ROUTES ====================

// Get platform-wide analytics
router.get(
  '/admin/platform',
  protect,
  authorize('admin'),
  getPlatformAnalytics
);

// Get user engagement metrics
router.get(
  '/admin/engagement',
  protect,
  authorize('admin'),
  getUserEngagement
);

// ==================== REPORT ROUTES ====================

// Generate report (PDF or Excel)
router.post(
  '/reports/generate',
  protect,
  generateReport
);

// Schedule a report for regular delivery
router.post(
  '/reports/schedule',
  protect,
  scheduleReport
);

// Get user's scheduled reports
router.get(
  '/reports/scheduled',
  protect,
  getScheduledReports
);

// Delete/cancel a scheduled report
router.delete(
  '/reports/scheduled/:id',
  protect,
  deleteScheduledReport
);

// Send report via email
router.post(
  '/reports/email',
  protect,
  emailReport
);

module.exports = router;
