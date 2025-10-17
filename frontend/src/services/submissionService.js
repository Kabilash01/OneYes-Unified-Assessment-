import api from './api';

export const submissionService = {
  /**
   * Get all submissions with filters
   * @param {Object} params - Query parameters (page, limit, status, search)
   * @returns {Promise} Response with submissions array and pagination
   */
  getSubmissions: async (params = {}) => {
    const response = await api.get('/student/submissions', { params });
    return response.data;
  },

  /**
   * Get detailed submission with statistics
   * @param {string} id - Submission ID
   * @returns {Promise} Response with submission and statistics
   */
  getSubmissionDetails: async (id) => {
    const response = await api.get(`/student/submissions/${id}`);
    return response.data;
  }
};
