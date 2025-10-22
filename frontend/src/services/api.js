import axios from 'axios';

/**
 * Axios instance configuration
 * @description Configured axios instance for API calls
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * @description Adds authentication token to requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * @description Handles errors globally
 */
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      return Promise.reject({
        message: data.message || 'An error occurred',
        errors: data.errors || [],
        status,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: 'No response from server. Please check your connection.',
        status: 0,
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        status: 0,
      });
    }
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Student API
export const studentAPI = {
  getDashboardStats: () => api.get('/student/dashboard/stats'),
  getAssessments: (params) => api.get('/student/assessments', { params }),
  getAssessmentById: (id) => api.get(`/student/assessments/${id}`),
  getAssessmentCalendar: (params) => api.get('/student/assessments/calendar', { params }),
  getInstructors: () => api.get('/student/instructors'),
  startAssessment: (id) => api.post(`/student/assessments/${id}/start`),
  saveAnswer: (id, data) => api.put(`/student/submissions/${id}/answer`, data),
  submitAssessment: (id) => api.post(`/student/submissions/${id}/submit`),
  getSubmissions: (params) => api.get('/student/submissions', { params }),
  getSubmissionById: (id) => api.get(`/student/submissions/${id}`),
};

// Instructor API
export const instructorAPI = {
  getDashboardStats: () => api.get('/instructor/dashboard/stats'),
  createAssessment: (data) => api.post('/instructor/assessments', data),
  updateAssessment: (id, data) => api.put(`/instructor/assessments/${id}`, data),
  deleteAssessment: (id) => api.delete(`/instructor/assessments/${id}`),
  getAssessments: (params) => api.get('/instructor/assessments', { params }),
  getAssessmentSubmissions: (id, params) =>
    api.get(`/instructor/assessments/${id}/submissions`, { params }),
  getSubmissionById: (id) => api.get(`/instructor/submissions/${id}`),
  evaluateSubmission: (id, data) =>
    api.put(`/instructor/submissions/${id}/evaluate`, data),
  getStudents: (params) => api.get('/instructor/students', { params }),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllAssessments: (params) => api.get('/admin/assessments', { params }),
  flagAssessment: (id, data) => api.put(`/admin/assessments/${id}/flag`, data),
  getLogs: (params) => api.get('/admin/logs', { params }),
  exportLogs: (params) => api.get('/admin/logs/export', { params, responseType: 'blob' }),
  getBranding: () => api.get('/admin/settings/branding'),
  updateBranding: (formData) => {
    return api.put('/admin/settings/branding', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  archiveOldData: (data) => api.post('/admin/settings/reset', data),
  getSuspiciousAlerts: (params) => api.get('/admin/alerts', { params }),
};

export default api;
