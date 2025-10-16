import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as dashboardService from '../services/studentDashboardService';

/**
 * Custom hook for managing student dashboard data
 * @returns {Object} Dashboard data and methods
 */
export const useStudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [performanceTrend, setPerformanceTrend] = useState([]);
  const [upcomingAssessments, setUpcomingAssessments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch all dashboard data
   */
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const data = await dashboardService.fetchAllDashboardData();

      setStats(data.stats);
      setPerformanceTrend(data.performanceTrend);
      setUpcomingAssessments(data.upcomingAssessments);
      setRecentActivity(data.recentActivity);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * Refresh only stats
   */
  const refreshStats = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await dashboardService.getDashboardStats();
      setStats(response.data || response);
      toast.success('Stats refreshed');
    } catch (err) {
      const errorMessage = err.message || 'Failed to refresh stats';
      toast.error(errorMessage);
      console.error('Stats refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  /**
   * Refresh all data
   */
  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    toast.info('Refreshing dashboard...');
    await fetchDashboardData(false);
    toast.success('Dashboard refreshed');
  }, [fetchDashboardData]);

  /**
   * Fetch performance trend only
   */
  const refreshPerformanceTrend = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await dashboardService.getPerformanceTrend();
      setPerformanceTrend(response.data || response);
    } catch (err) {
      const errorMessage = err.message || 'Failed to refresh performance trend';
      toast.error(errorMessage);
      console.error('Performance trend refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  /**
   * Fetch upcoming assessments only
   */
  const refreshUpcomingAssessments = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await dashboardService.getUpcomingAssessments(5);
      setUpcomingAssessments(response.data?.assessments || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to refresh upcoming assessments';
      toast.error(errorMessage);
      console.error('Upcoming assessments refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  /**
   * Fetch recent activity only
   */
  const refreshRecentActivity = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await dashboardService.getRecentActivity(10);
      setRecentActivity(response.data?.activities || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to refresh recent activity';
      toast.error(errorMessage);
      console.error('Recent activity refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    // Data
    stats,
    performanceTrend,
    upcomingAssessments,
    recentActivity,
    
    // States
    loading,
    error,
    refreshing,
    
    // Methods
    refreshStats,
    refreshAll,
    refreshPerformanceTrend,
    refreshUpcomingAssessments,
    refreshRecentActivity,
    fetchDashboardData,
  };
};

export default useStudentDashboard;
