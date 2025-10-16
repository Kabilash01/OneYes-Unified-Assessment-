import api from './api';

/**
 * Notification Service
 * Handles all notification-related API calls
 */
const notificationService = {
  /**
   * Get all notifications
   * @param {Object} params - Query parameters (unread, limit, page)
   * @returns {Promise<Object>} Notifications data with pagination
   */
  getNotifications: async (params = {}) => {
    try {
      const { unread, limit = 20, page = 1 } = params;
      const response = await api.get('/student/notifications', {
        params: { unread, limit, page }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise<number>} Unread count
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get('/student/notifications/count');
      return response.data.count;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/student/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Success message
   */
  markAllAsRead: async () => {
    try {
      const response = await api.put('/student/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Success message
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/student/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default notificationService;
