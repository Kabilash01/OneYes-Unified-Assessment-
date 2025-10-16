const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  registerValidation,
  loginValidation,
} = require('../utils/validators');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user details
 * @access  Private
 */
router.get('/me', authMiddleware, getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authMiddleware, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;
