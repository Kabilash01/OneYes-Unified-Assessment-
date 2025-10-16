import api from './api';

/**
 * Student Dashboard Service
 * Handles all API calls for the student dashboard
 */

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Dashboard stats including total assessments, average score, etc.
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/student/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw {
      message: error.message || 'Failed to fetch dashboard statistics',
      status: error.status || 500,
    };
  }
};

/**
 * Get performance trend for last 6 months
 * @returns {Promise<Array>} Array of monthly performance data
 */
export const getPerformanceTrend = async () => {
  try {
    const response = await api.get('/student/dashboard/performance-trend');
    return response.data;
  } catch (error) {
    console.error('Error fetching performance trend:', error);
    throw {
      message: error.message || 'Failed to fetch performance trend',
      status: error.status || 500,
    };
  }
};

/**
 * Get upcoming assessments
 * @param {number} limit - Maximum number of assessments to fetch
 * @returns {Promise<Object>} Object containing array of upcoming assessments
 */
export const getUpcomingAssessments = async (limit = 5) => {
  try {
    const response = await api.get('/student/dashboard/upcoming-assessments', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming assessments:', error);
    throw {
      message: error.message || 'Failed to fetch upcoming assessments',
      status: error.status || 500,
    };
  }
};

/**
 * Get recent activity
 * @param {number} limit - Maximum number of activities to fetch
 * @returns {Promise<Object>} Object containing array of recent activities
 */
export const getRecentActivity = async (limit = 10) => {
  try {
    const response = await api.get('/student/dashboard/recent-activity', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw {
      message: error.message || 'Failed to fetch recent activity',
      status: error.status || 500,
    };
  }
};

/**
 * Fetch all dashboard data in parallel
 * @returns {Promise<Object>} Object containing all dashboard data
 */
export const fetchAllDashboardData = async () => {
  try {
    const [stats, performanceTrend, upcomingAssessments, recentActivity] = await Promise.all([
      getDashboardStats(),
      getPerformanceTrend(),
      getUpcomingAssessments(5),
      getRecentActivity(10),
    ]);

    return {
      stats: stats.data || stats,
      performanceTrend: performanceTrend.data || performanceTrend,
      upcomingAssessments: upcomingAssessments.data?.assessments || [],
      recentActivity: recentActivity.data?.activities || [],
    };
  } catch (error) {
    console.error('Error fetching all dashboard data:', error);
    throw {
      message: error.message || 'Failed to load dashboard data',
      status: error.status || 500,
    };
  }
};

export default {
  getDashboardStats,
  getPerformanceTrend,
  getUpcomingAssessments,
  getRecentActivity,
  fetchAllDashboardData,
};
