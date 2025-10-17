import api from './api';

/**
 * Assessment Service
 * Handles all assessment-related API calls
 */
export const assessmentService = {
  /**
   * Get available assessments with filters
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} - API response
   */
  getAssessments: async (params) => {
    try {
      const response = await api.get('/student/assessments', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get assessment details by ID
   * @param {string} id - Assessment ID
   * @returns {Promise} - API response
   */
  getAssessmentById: async (id) => {
    try {
      const response = await api.get(`/student/assessments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Start an assessment
   * @param {string} id - Assessment ID
   * @returns {Promise} - API response
   */
  startAssessment: async (id) => {
    try {
      const response = await api.post(`/student/assessments/${id}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Submit an assessment
   * @param {string} id - Assessment ID
   * @param {Object} data - Submission data
   * @returns {Promise} - API response
   */
  submitAssessment: async (id, data) => {
    try {
      const response = await api.post(`/student/assessments/${id}/submit`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Auto-save assessment progress
   * @param {string} submissionId - Submission ID
   * @param {Object} data - Progress data
   * @returns {Promise} - API response
   */
  saveProgress: async (submissionId, data) => {
    try {
      const response = await api.put(`/student/submissions/${submissionId}/progress`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default assessmentService;
