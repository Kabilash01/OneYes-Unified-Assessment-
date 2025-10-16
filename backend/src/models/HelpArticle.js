const mongoose = require('mongoose');

const helpArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true
    },
    category: {
      type: String,
      enum: ['getting-started', 'taking-tests', 'submissions', 'results', 'account', 'troubleshooting'],
      required: true,
      index: true
    },
    subcategory: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    excerpt: {
      type: String,
      maxlength: 200
    },
    tags: [{
      type: String,
      trim: true
    }],
    icon: {
      type: String,
      default: 'BookOpen'
    },
    readTime: {
      type: Number, // in minutes
      default: 3
    },
    views: {
      type: Number,
      default: 0
    },
    helpful: {
      type: Number,
      default: 0
    },
    notHelpful: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    relatedArticles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelpArticle'
    }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Generate slug from title before saving
helpArticleSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index for text search
helpArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Index for efficient querying
helpArticleSchema.index({ category: 1, isPublished: 1, order: 1 });

// Static method to increment views
helpArticleSchema.statics.incrementViews = async function(articleId) {
  await this.findByIdAndUpdate(articleId, { $inc: { views: 1 } });
};

// Static method to search articles
helpArticleSchema.statics.searchArticles = async function(query) {
  return await this.find(
    { $text: { $search: query }, isPublished: true },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('HelpArticle', helpArticleSchema);
