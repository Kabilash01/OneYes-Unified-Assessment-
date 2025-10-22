const express = require('express');
const router = express.Router();
const { 
  globalSearch, 
  getSearchSuggestions, 
  getRecentSearches 
} = require('../controllers/searchController');
const authMiddleware = require('../middlewares/authMiddleware');

// All search routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/search
 * @desc    Global search across all entities
 * @access  Private
 * @query   query (string, required, min 2 chars)
 *          type (string, optional: 'all', 'users', 'assessments', 'announcements', 'logs')
 *          limit (number, optional, default 10, max 50)
 */
router.get('/', globalSearch);

/**
 * @route   GET /api/search/suggestions
 * @desc    Get autocomplete suggestions
 * @access  Private
 * @query   query (string, required, min 2 chars)
 */
router.get('/suggestions', getSearchSuggestions);

/**
 * @route   GET /api/search/recent
 * @desc    Get recent searches for current user
 * @access  Private
 */
router.get('/recent', getRecentSearches);

module.exports = router;
