const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleBySlug,
  getCategories,
  searchArticles,
  getFAQ,
  createSupportTicket,
  getUserTickets,
  getTicketByNumber,
  submitArticleFeedback,
} = require('../controllers/helpController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

/**
 * PUBLIC ROUTES
 */

/**
 * @route   GET /api/help/articles
 * @desc    Get all help articles
 * @access  Public
 */
router.get('/articles', getArticles);

/**
 * @route   GET /api/help/articles/:slug
 * @desc    Get article by slug
 * @access  Public
 */
router.get('/articles/:slug', getArticleBySlug);

/**
 * @route   GET /api/help/categories
 * @desc    Get all categories with article counts
 * @access  Public
 */
router.get('/categories', getCategories);

/**
 * @route   GET /api/help/search
 * @desc    Search help articles
 * @access  Public
 */
router.get('/search', searchArticles);

/**
 * @route   GET /api/help/faq
 * @desc    Get FAQ articles
 * @access  Public
 */
router.get('/faq', getFAQ);

/**
 * @route   POST /api/help/articles/:id/feedback
 * @desc    Submit article feedback
 * @access  Public
 */
router.post('/articles/:id/feedback', submitArticleFeedback);

/**
 * PRIVATE ROUTES (Require Authentication)
 */

/**
 * @route   POST /api/help/tickets
 * @desc    Submit support ticket
 * @access  Private
 */
router.post(
  '/tickets',
  authMiddleware,
  uploadMiddleware.single('attachment'),
  createSupportTicket
);

/**
 * @route   GET /api/help/tickets
 * @desc    Get user's support tickets
 * @access  Private
 */
router.get('/tickets', authMiddleware, getUserTickets);

/**
 * @route   GET /api/help/tickets/:ticketNumber
 * @desc    Get ticket by ticket number
 * @access  Private
 */
router.get('/tickets/:ticketNumber', authMiddleware, getTicketByNumber);

module.exports = router;
