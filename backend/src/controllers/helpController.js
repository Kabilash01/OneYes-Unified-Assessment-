const HelpArticle = require('../models/HelpArticle');
const SupportTicket = require('../models/SupportTicket');

/**
 * @desc    Get all help articles
 * @route   GET /api/help/articles
 * @access  Public
 */
exports.getArticles = async (req, res, next) => {
  try {
    const { category, featured, limit = 20, page = 1 } = req.query;

    const query = { isPublished: true };
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;

    const skip = (page - 1) * parseInt(limit);
    const total = await HelpArticle.countDocuments(query);

    const articles = await HelpArticle.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-content')
      .lean();

    res.status(200).json({
      success: true,
      articles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get article by slug
 * @route   GET /api/help/articles/:slug
 * @access  Public
 */
exports.getArticleBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const article = await HelpArticle.findOne({ slug, isPublished: true })
      .populate('relatedArticles', 'title slug excerpt icon readTime')
      .lean();

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Increment views
    await HelpArticle.incrementViews(article._id);

    res.status(200).json({
      success: true,
      article
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all categories with article counts
 * @route   GET /api/help/categories
 * @access  Public
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await HelpArticle.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          articles: {
            $push: {
              _id: '$_id',
              title: '$title',
              slug: '$slug',
              excerpt: '$excerpt',
              readTime: '$readTime'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search help articles
 * @route   GET /api/help/search
 * @access  Public
 */
exports.searchArticles = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const articles = await HelpArticle.searchArticles(q);

    res.status(200).json({
      success: true,
      articles,
      count: articles.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get FAQ articles
 * @route   GET /api/help/faq
 * @access  Public
 */
exports.getFAQ = async (req, res, next) => {
  try {
    // FAQ articles are those tagged with 'faq'
    const faqArticles = await HelpArticle.find({
      isPublished: true,
      tags: 'faq'
    })
      .sort({ order: 1 })
      .select('title content category icon')
      .lean();

    res.status(200).json({
      success: true,
      faqs: faqArticles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit support ticket
 * @route   POST /api/help/tickets
 * @access  Private
 */
exports.createSupportTicket = async (req, res, next) => {
  try {
    const { subject, message, priority } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    const ticketData = {
      userId: req.user._id,
      email: req.user.email,
      subject,
      message,
      priority: priority || 'medium'
    };

    // Handle file attachment if uploaded
    if (req.file) {
      ticketData.attachment = {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      };
    }

    const ticket = await SupportTicket.create(ticketData);

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket: {
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's support tickets
 * @route   GET /api/help/tickets
 * @access  Private
 */
exports.getUserTickets = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const skip = (page - 1) * parseInt(limit);
    const total = await SupportTicket.countDocuments(query);

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-attachment')
      .lean();

    res.status(200).json({
      success: true,
      tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ticket by ticket number
 * @route   GET /api/help/tickets/:ticketNumber
 * @access  Private
 */
exports.getTicketByNumber = async (req, res, next) => {
  try {
    const { ticketNumber } = req.params;
    const userId = req.user._id;

    const ticket = await SupportTicket.findOne({
      ticketNumber,
      userId
    }).lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark article as helpful/not helpful
 * @route   POST /api/help/articles/:id/feedback
 * @access  Public
 */
exports.submitArticleFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    const updateField = helpful ? 'helpful' : 'notHelpful';

    await HelpArticle.findByIdAndUpdate(
      id,
      { $inc: { [updateField]: 1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback'
    });
  } catch (error) {
    next(error);
  }
};
