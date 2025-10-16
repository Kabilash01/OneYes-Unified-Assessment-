import api from './api';

/**
 * Help Service
 * Handles all help and support-related API calls
 */
const helpService = {
  /**
   * Get all help articles
   * @param {Object} params - Query parameters (category, featured, limit, page)
   * @returns {Promise<Object>} Articles data with pagination
   */
  getArticles: async (params = {}) => {
    try {
      const response = await api.get('/help/articles', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get article by slug
   * @param {string} slug - Article slug
   * @returns {Promise<Object>} Article data
   */
  getArticleBySlug: async (slug) => {
    try {
      const response = await api.get(`/help/articles/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get all categories with article counts
   * @returns {Promise<Array>} Categories data
   */
  getCategories: async () => {
    try {
      const response = await api.get('/help/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Search help articles
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching articles
   */
  searchArticles: async (query) => {
    try {
      const response = await api.get('/help/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get FAQ articles
   * @returns {Promise<Array>} FAQ articles
   */
  getFAQ: async () => {
    try {
      const response = await api.get('/help/faq');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Submit support ticket
   * @param {Object} ticketData - Ticket data (subject, message, priority, attachment)
   * @returns {Promise<Object>} Created ticket
   */
  createSupportTicket: async (ticketData) => {
    try {
      const formData = new FormData();
      formData.append('subject', ticketData.subject);
      formData.append('message', ticketData.message);
      
      if (ticketData.priority) {
        formData.append('priority', ticketData.priority);
      }
      
      if (ticketData.attachment) {
        formData.append('attachment', ticketData.attachment);
      }

      const response = await api.post('/help/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user's support tickets
   * @param {Object} params - Query parameters (status, page, limit)
   * @returns {Promise<Object>} Tickets data with pagination
   */
  getUserTickets: async (params = {}) => {
    try {
      const response = await api.get('/help/tickets', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get ticket by ticket number
   * @param {string} ticketNumber - Ticket number
   * @returns {Promise<Object>} Ticket data
   */
  getTicketByNumber: async (ticketNumber) => {
    try {
      const response = await api.get(`/help/tickets/${ticketNumber}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Submit article feedback
   * @param {string} articleId - Article ID
   * @param {boolean} helpful - Whether article was helpful
   * @returns {Promise<Object>} Success message
   */
  submitArticleFeedback: async (articleId, helpful) => {
    try {
      const response = await api.post(`/help/articles/${articleId}/feedback`, {
        helpful
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default helpService;
