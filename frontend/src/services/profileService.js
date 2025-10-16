import api from './api';

/**
 * Profile Service
 * Handles all profile-related API calls
 */
const profileService = {
  /**
   * Get student profile
   * @returns {Promise<Object>} Profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/student/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update student profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/student/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Upload profile avatar
   * @param {File} file - Avatar image file
   * @returns {Promise<Object>} Avatar URL
   */
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/student/profile/avatar', formData, {
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
   * Change password
   * @param {Object} passwordData - Current and new password
   * @returns {Promise<Object>} Success message
   */
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/student/profile/password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get activity log
   * @param {Object} params - Query parameters (type, from, to, page, limit)
   * @returns {Promise<Object>} Activity data with pagination
   */
  getActivity: async (params = {}) => {
    try {
      const response = await api.get('/student/profile/activity', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get active sessions
   * @returns {Promise<Array>} Active sessions
   */
  getSessions: async () => {
    try {
      const response = await api.get('/student/profile/sessions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Terminate session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Success message
   */
  terminateSession: async (sessionId) => {
    try {
      const response = await api.delete(`/student/profile/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default profileService;
