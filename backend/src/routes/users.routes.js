const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { protect, authorize } = require('../middlewares/auth');

/**
 * @route   GET /api/users
 * @desc    Get users (for ticket assignment)
 * @access  Private (Instructor/Admin)
 */
router.get('/', protect, authorize('instructor', 'admin'), usersController.getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', protect, usersController.getUserById);

module.exports = router;
