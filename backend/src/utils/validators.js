const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware wrapper
 * @description Checks validation results and returns errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * User Registration Validation
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['student', 'instructor', 'admin'])
    .withMessage('Role must be student, instructor, or admin'),
  body('instituteCode').optional().trim().toUpperCase(),
  validate,
];

/**
 * User Login Validation
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

/**
 * Assessment Creation Validation
 */
const assessmentValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Assessment title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),
  body('totalMarks')
    .notEmpty()
    .withMessage('Total marks is required')
    .isInt({ min: 0 })
    .withMessage('Total marks cannot be negative'),
  body('questions')
    .notEmpty()
    .withMessage('Questions are required')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  body('questions.*.type')
    .isIn(['mcq', 'short', 'long'])
    .withMessage('Question type must be mcq, short, or long'),
  body('questions.*.questionText')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),
  body('questions.*.marks')
    .isInt({ min: 0 })
    .withMessage('Marks must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  validate,
];

/**
 * Submission Evaluation Validation
 */
const evaluationValidation = [
  body('score')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Score must be a non-negative number'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Feedback cannot exceed 2000 characters'),
  body('answers').optional().isArray().withMessage('Answers must be an array'),
  validate,
];

/**
 * MongoDB ObjectId Validation
 */
const objectIdValidation = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage('Invalid ID format'),
  validate,
];

/**
 * Pagination Validation
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  assessmentValidation,
  evaluationValidation,
  objectIdValidation,
  paginationValidation,
};
