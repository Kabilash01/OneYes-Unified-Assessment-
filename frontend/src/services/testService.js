import api from './api';

export const testService = {
  /**
   * Start or resume assessment
   * @param {string} id - Assessment ID
   * @returns {Promise} Response with submission and assessment data
   */
  startAssessment: async (id) => {
    const response = await api.post(`/student/assessments/${id}/start`);
    return response.data;
  },

  /**
   * Save answer (auto-save)
   * @param {string} submissionId - Submission ID
   * @param {string} questionId - Question ID
   * @param {any} answer - Answer data (string, array, or rich text)
   * @returns {Promise} Response with last saved timestamp
   */
  saveAnswer: async (submissionId, questionId, answer) => {
    const response = await api.put(`/student/submissions/${submissionId}/answer`, {
      questionId,
      answer
    });
    return response.data;
  },

  /**
   * Submit assessment
   * @param {string} submissionId - Submission ID
   * @returns {Promise} Response with final score and percentage
   */
  submitAssessment: async (submissionId) => {
    const response = await api.post(`/student/submissions/${submissionId}/submit`);
    return response.data;
  }
};
