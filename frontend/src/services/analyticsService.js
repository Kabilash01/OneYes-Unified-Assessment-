import api from './api';

/**
 * Analytics Service
 * Handles all analytics-related API calls
 */

const analyticsService = {
  // ==================== STUDENT ANALYTICS ====================

  /**
   * Get student analytics
   * @param {String} studentId - Student ID
   * @param {String} startDate - Start date (optional)
   * @param {String} endDate - End date (optional)
   * @returns {Promise}
   */
  getStudentAnalytics: (studentId, startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return api.get(`/analytics/student/${studentId}`, { params });
  },

  /**
   * Get student comparison data for specific assessment
   * @param {String} studentId - Student ID
   * @param {String} assessmentId - Assessment ID
   * @returns {Promise}
   */
  getStudentComparison: (studentId, assessmentId) => {
    return api.get(`/analytics/student/${studentId}/comparison/${assessmentId}`);
  },

  // ==================== INSTRUCTOR ANALYTICS ====================

  /**
   * Get instructor analytics overview
   * @param {String} instructorId - Instructor ID
   * @param {String} startDate - Start date (optional)
   * @param {String} endDate - End date (optional)
   * @returns {Promise}
   */
  getInstructorAnalytics: (instructorId, startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return api.get(`/analytics/instructor/${instructorId}`, { params });
  },

  /**
   * Get class performance for specific assessment
   * @param {String} assessmentId - Assessment ID
   * @returns {Promise}
   */
  getClassAnalytics: (assessmentId) => {
    return api.get(`/analytics/class/${assessmentId}`);
  },

  /**
   * Get assessment difficulty analysis
   * @param {String} assessmentId - Assessment ID
   * @returns {Promise}
   */
  getAssessmentDifficulty: (assessmentId) => {
    return api.get(`/analytics/assessment/${assessmentId}/difficulty`);
  },

  // ==================== ADMIN ANALYTICS ====================

  /**
   * Get platform-wide analytics
   * @param {String} startDate - Start date (optional)
   * @param {String} endDate - End date (optional)
   * @returns {Promise}
   */
  getPlatformAnalytics: (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return api.get('/analytics/admin/platform', { params });
  },

  /**
   * Get user engagement metrics
   * @returns {Promise}
   */
  getUserEngagement: () => {
    return api.get('/analytics/admin/engagement');
  },

  // ==================== REPORT GENERATION ====================

  /**
   * Generate analytics report (PDF or Excel)
   * @param {Object} config - Report configuration
   * @param {String} config.reportType - 'student', 'instructor', 'admin'
   * @param {String} config.format - 'pdf' or 'excel'
   * @param {Object} config.options - Additional options
   * @returns {Promise} - Returns blob
   */
  generateReport: (config) => {
    return api.post('/analytics/reports/generate', config, {
      responseType: 'blob'
    });
  },

  /**
   * Schedule a report for regular delivery
   * @param {Object} config - Schedule configuration
   * @param {String} config.reportType - 'student', 'instructor', 'admin'
   * @param {String} config.frequency - 'daily', 'weekly', 'monthly'
   * @param {String} config.format - 'pdf' or 'excel'
   * @param {Object} config.filters - Custom filters (optional)
   * @returns {Promise}
   */
  scheduleReport: (config) => {
    return api.post('/analytics/reports/schedule', config);
  },

  /**
   * Get user's scheduled reports
   * @returns {Promise}
   */
  getScheduledReports: () => {
    return api.get('/analytics/reports/scheduled');
  },

  /**
   * Delete/cancel a scheduled report
   * @param {String} reportId - Report ID
   * @returns {Promise}
   */
  deleteScheduledReport: (reportId) => {
    return api.delete(`/analytics/reports/scheduled/${reportId}`);
  },

  /**
   * Send report via email
   * @param {Object} config - Report configuration
   * @param {String} config.reportType - 'student', 'instructor', 'admin'
   * @param {String} config.format - 'pdf' or 'excel'
   * @param {Object} config.options - Additional options
   * @returns {Promise}
   */
  emailReport: (config) => {
    return api.post('/analytics/reports/email', config);
  },
};

export default analyticsService;
