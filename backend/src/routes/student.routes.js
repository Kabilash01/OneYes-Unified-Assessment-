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
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
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

module.exports = router;
