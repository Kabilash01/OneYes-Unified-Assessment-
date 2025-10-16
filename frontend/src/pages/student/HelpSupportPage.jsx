import React, { useState, useEffect } from 'react';
import { Search, BookOpen, MessageCircle, FileText, Mail, Phone, ExternalLink, ChevronDown, ChevronUp, Send, Paperclip, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { toast } from 'react-toastify';

/**
 * Help & Support Page
 * Comprehensive help center with search, FAQ, categories, and contact form
 */
const HelpSupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: 'technical',
    email: '',
    message: '',
    attachment: null
  });
  const [loading, setLoading] = useState(false);

  // Mock quick help cards
  const quickHelpCards = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Getting Started',
      description: 'Learn the basics of using the platform',
      link: '/help/getting-started',
      color: 'blue'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Taking Tests',
      description: 'How to start and complete assessments',
      link: '/help/taking-tests',
      color: 'green'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Contact Support',
      description: 'Get help from our support team',
      action: () => setShowContactForm(true),
      color: 'purple'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'FAQs',
      description: 'Frequently asked questions',
      action: () => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' }),
      color: 'orange'
    }
  ];

  // Mock categories
  const categories = [
    { id: 'all', label: 'All Topics', count: 45 },
    { id: 'getting-started', label: 'Getting Started', count: 8 },
    { id: 'taking-tests', label: 'Taking Tests', count: 12 },
    { id: 'submissions', label: 'Submissions', count: 6 },
    { id: 'results', label: 'Results', count: 5 },
    { id: 'account', label: 'Account', count: 9 },
    { id: 'troubleshooting', label: 'Troubleshooting', count: 5 }
  ];

  // Mock FAQ data
  const faqs = [
    {
      id: '1',
      category: 'getting-started',
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Sign Up" button on the homepage. Fill in your details including name, email, and password. You\'ll receive a verification email to activate your account.'
    },
    {
      id: '2',
      category: 'taking-tests',
      question: 'How do I start an assessment?',
      answer: 'Navigate to the "Assessments" page from the sidebar. Find the assessment you want to take and click "Start Assessment". Make sure you have a stable internet connection before starting.'
    },
    {
      id: '3',
      category: 'taking-tests',
      question: 'Can I pause an assessment and continue later?',
      answer: 'Yes, most assessments support auto-save. Your progress is saved automatically every 30 seconds. You can safely close the browser and continue later from where you left off.'
    },
    {
      id: '4',
      category: 'submissions',
      question: 'How do I submit my assessment?',
      answer: 'After completing all questions, click the "Submit" button at the bottom of the assessment page. You\'ll be asked to confirm your submission. Once submitted, you cannot make changes.'
    },
    {
      id: '5',
      category: 'results',
      question: 'When will I see my results?',
      answer: 'Results are typically available within 24-48 hours after submission. You\'ll receive a notification when your results are published. Check the "Results" section in your dashboard.'
    },
    {
      id: '6',
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your email address and you\'ll receive a password reset link. Follow the instructions in the email to create a new password.'
    },
    {
      id: '7',
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Go to your Profile page from the top-right menu. Click "Edit Profile" to update your personal information, contact details, and academic information.'
    },
    {
      id: '8',
      category: 'troubleshooting',
      question: 'What should I do if I experience technical issues during an assessment?',
      answer: 'If you face technical issues, try refreshing the page first. Your progress is auto-saved. If the issue persists, contact support immediately through the help chat or email.'
    },
    {
      id: '9',
      category: 'troubleshooting',
      question: 'Why can\'t I see my assessment?',
      answer: 'Make sure the assessment is scheduled for the current time. Check if you\'re logged in with the correct account. If the issue persists, contact your instructor or support team.'
    },
    {
      id: '10',
      category: 'results',
      question: 'Can I request a re-evaluation of my assessment?',
      answer: 'Yes, you can request a re-evaluation within 7 days of result publication. Go to the specific assessment result and click "Request Re-evaluation". Provide a detailed reason for your request.'
    }
  ];

  // Mock recent articles
  const recentArticles = [
    {
      id: '1',
      title: 'Getting Started with Your First Assessment',
      excerpt: 'A comprehensive guide to help you navigate your first assessment on the platform.',
      category: 'Getting Started',
      readTime: '5 min read',
      views: 1234
    },
    {
      id: '2',
      title: 'Understanding Your Assessment Results',
      excerpt: 'Learn how to interpret your scores, view detailed feedback, and track your progress.',
      category: 'Results',
      readTime: '4 min read',
      views: 987
    },
    {
      id: '3',
      title: 'Tips for Successful Test Taking',
      excerpt: 'Best practices and strategies to help you perform better in online assessments.',
      category: 'Taking Tests',
      readTime: '6 min read',
      views: 1456
    },
    {
      id: '4',
      title: 'Troubleshooting Common Issues',
      excerpt: 'Solutions to the most common technical problems users encounter.',
      category: 'Troubleshooting',
      readTime: '3 min read',
      views: 765
    }
  ];

  // Filter FAQs
  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle FAQ toggle
  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, attachment: file }));
    }
  };

  // Remove attachment
  const removeAttachment = () => {
    setFormData(prev => ({ ...prev, attachment: null }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock API call - would use helpService.createSupportTicket()
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Support ticket submitted successfully! We\'ll get back to you soon.');
      setShowContactForm(false);
      setFormData({
        subject: 'technical',
        email: '',
        message: '',
        attachment: null
      });
    } catch (error) {
      toast.error('Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get color classes
  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            How can we help you?
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Search our knowledge base or contact support
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles, FAQs, or guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickHelpCards.map((card, index) => (
            <button
              key={index}
              onClick={card.action || (() => {})}
              className="bg-white rounded-xl border p-6 text-left hover:shadow-lg transition-all hover:border-blue-300"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${getColorClasses(card.color)}`}>
                {card.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.description}</p>
            </button>
          ))}
        </div>

        {/* Categories Sidebar + FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.label}</span>
                      <span className="text-sm text-gray-500">{category.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-3" id="faq-section">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>

              {filteredFAQs.length === 0 ? (
                <EmptyState
                  variant="search"
                  title="No FAQs found"
                  message="Try adjusting your search or category filter"
                />
              ) : (
                <div className="space-y-3">
                  {filteredFAQs.map(faq => (
                    <div
                      key={faq.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 pr-4">
                          {faq.question}
                        </span>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      
                      {expandedFAQ === faq.id && (
                        <div className="px-6 pb-4 text-gray-600">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentArticles.map(article => (
              <div
                key={article.id}
                className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-500">{article.readTime}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{article.views} views</span>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                    Read more
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Resources */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Still need help?
            </h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                icon={<MessageCircle className="w-4 h-4" />}
                onClick={() => setShowContactForm(true)}
              >
                Contact Support
              </Button>
              <Button
                variant="outline"
                icon={<Mail className="w-4 h-4" />}
              >
                Email: support@unifiedassessment.com
              </Button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>Call us: +1 (555) 123-4567</span>
            </div>
          </div>
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Contact Support
                </h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="technical">Technical Issue</option>
                    <option value="account">Account Problem</option>
                    <option value="assessment">Assessment Question</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    required
                    rows={6}
                    maxLength={1000}
                    placeholder="Please describe your issue in detail..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/1000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachment (optional)
                  </label>
                  {formData.attachment ? (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {formData.attachment.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(formData.attachment.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors">
                      <Paperclip className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, PDF up to 5MB
                      </p>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowContactForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<Send className="w-4 h-4" />}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HelpSupportPage;
