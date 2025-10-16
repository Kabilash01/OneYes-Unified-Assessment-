import api from './api';

/**
 * Settings Service
 * Handles all settings-related API calls
 */
const settingsService = {
  /**
   * Get all user settings
   * @returns {Promise<Object>} Settings data
   */
  getSettings: async () => {
    try {
      const response = await api.get('/student/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update general settings
   * @param {Object} generalSettings - General settings data
   * @returns {Promise<Object>} Updated settings
   */
  updateGeneralSettings: async (generalSettings) => {
    try {
      const response = await api.put('/student/settings/general', generalSettings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update notification settings
   * @param {Object} notificationSettings - Notification settings data
   * @returns {Promise<Object>} Updated settings
   */
  updateNotificationSettings: async (notificationSettings) => {
    try {
      const response = await api.put('/student/settings/notifications', notificationSettings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update appearance settings
   * @param {Object} appearanceSettings - Appearance settings data
   * @returns {Promise<Object>} Updated settings
   */
  updateAppearanceSettings: async (appearanceSettings) => {
    try {
      const response = await api.put('/student/settings/appearance', appearanceSettings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update privacy settings
   * @param {Object} privacySettings - Privacy settings data
   * @returns {Promise<Object>} Updated settings
   */
  updatePrivacySettings: async (privacySettings) => {
    try {
      const response = await api.put('/student/settings/privacy', privacySettings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update accessibility settings
   * @param {Object} accessibilitySettings - Accessibility settings data
   * @returns {Promise<Object>} Updated settings
   */
  updateAccessibilitySettings: async (accessibilitySettings) => {
    try {
      const response = await api.put('/student/settings/accessibility', accessibilitySettings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default settingsService;
