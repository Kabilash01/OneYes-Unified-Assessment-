const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessments,
  getAssessmentSubmissions,
  getSubmissionById,
  evaluateSubmission,
  getStudents,
} = require('../controllers/instructorController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  assessmentValidation,
  evaluationValidation,
  objectIdValidation,
  paginationValidation,
} = require('../utils/validators');

// All instructor routes require authentication and instructor role
router.use(authMiddleware);
router.use(roleMiddleware('instructor'));

/**
 * @route   GET /api/instructor/dashboard/stats
 * @desc    Get instructor dashboard statistics
 * @access  Private (Instructor)
 */
router.get('/dashboard/stats', getDashboardStats);

/**
 * @route   POST /api/instructor/assessments
 * @desc    Create new assessment
 * @access  Private (Instructor)
 */
router.post('/assessments', assessmentValidation, createAssessment);

/**
 * @route   PUT /api/instructor/assessments/:id
 * @desc    Update assessment
 * @access  Private (Instructor)
 */
router.put('/assessments/:id', objectIdValidation('id'), updateAssessment);

/**
 * @route   DELETE /api/instructor/assessments/:id
 * @desc    Delete assessment
 * @access  Private (Instructor)
 */
router.delete('/assessments/:id', objectIdValidation('id'), deleteAssessment);

/**
 * @route   GET /api/instructor/assessments
 * @desc    Get all assessments
 * @access  Private (Instructor)
 */
router.get('/assessments', paginationValidation, getAssessments);

/**
 * @route   GET /api/instructor/assessments/:id/submissions
 * @desc    Get submissions for an assessment
 * @access  Private (Instructor)
 */
router.get(
  '/assessments/:id/submissions',
  objectIdValidation('id'),
  paginationValidation,
  getAssessmentSubmissions
);

/**
 * @route   GET /api/instructor/submissions/:id
 * @desc    Get specific submission
 * @access  Private (Instructor)
 */
router.get('/submissions/:id', objectIdValidation('id'), getSubmissionById);

/**
 * @route   PUT /api/instructor/submissions/:id/evaluate
 * @desc    Evaluate submission
 * @access  Private (Instructor)
 */
router.put(
  '/submissions/:id/evaluate',
  objectIdValidation('id'),
  evaluationValidation,
  evaluateSubmission
);

/**
 * @route   GET /api/instructor/students
 * @desc    Get list of students
 * @access  Private (Instructor)
 */
router.get('/students', paginationValidation, getStudents);

module.exports = router;
