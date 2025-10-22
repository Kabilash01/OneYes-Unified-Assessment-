import { useState, useEffect, useCallback } from 'react';
import analyticsService from '../services/analyticsService';
import { toast } from 'react-toastify';

/**
 * Hook for student analytics
 * @param {String} studentId - Student ID
 * @param {Object} dateRange - Date range { start, end }
 * @returns {Object} - Analytics data, loading state, error, and refetch function
 */
export const useStudentAnalytics = (studentId, dateRange = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsService.getStudentAnalytics(
        studentId,
        dateRange.start,
        dateRange.end
      );
      
      setData(response.data.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error fetching analytics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [studentId, dateRange.start, dateRange.end]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch: fetchAnalytics };
};

/**
 * Hook for instructor analytics
 * @param {String} instructorId - Instructor ID
 * @param {Object} dateRange - Date range { start, end }
 * @returns {Object} - Analytics data, loading state, error, and refetch function
 */
export const useInstructorAnalytics = (instructorId, dateRange = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    if (!instructorId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsService.getInstructorAnalytics(
        instructorId,
        dateRange.start,
        dateRange.end
      );
      
      setData(response.data.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error fetching analytics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [instructorId, dateRange.start, dateRange.end]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch: fetchAnalytics };
};

/**
 * Hook for class analytics
 * @param {String} assessmentId - Assessment ID
 * @returns {Object} - Analytics data, loading state, error, and refetch function
 */
export const useClassAnalytics = (assessmentId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    if (!assessmentId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsService.getClassAnalytics(assessmentId);
      setData(response.data.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error fetching class analytics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch: fetchAnalytics };
};

/**
 * Hook for platform analytics (Admin)
 * @param {Object} dateRange - Date range { start, end }
 * @returns {Object} - Analytics data, loading state, error, and refetch function
 */
export const usePlatformAnalytics = (dateRange = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsService.getPlatformAnalytics(
        dateRange.start,
        dateRange.end
      );
      
      setData(response.data.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error fetching platform analytics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch: fetchAnalytics };
};

/**
 * Hook for scheduled reports
 * @returns {Object} - Scheduled reports data, loading state, error, and CRUD functions
 */
export const useScheduledReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsService.getScheduledReports();
      setReports(response.data.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error fetching scheduled reports';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const createReport = async (config) => {
    try {
      await analyticsService.scheduleReport(config);
      toast.success('Report scheduled successfully');
      await fetchReports();
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error scheduling report';
      toast.error(errorMessage);
      return false;
    }
  };

  const deleteReport = async (reportId) => {
    try {
      await analyticsService.deleteScheduledReport(reportId);
      toast.success('Scheduled report cancelled');
      await fetchReports();
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error deleting report';
      toast.error(errorMessage);
      return false;
    }
  };

  return {
    reports,
    loading,
    error,
    createReport,
    deleteReport,
    refetch: fetchReports
  };
};

/**
 * Hook for generating and downloading reports
 * @returns {Object} - Generate and email functions with loading states
 */
export const useReportGeneration = () => {
  const [generating, setGenerating] = useState(false);
  const [emailing, setEmailing] = useState(false);

  const generateReport = async (config) => {
    try {
      setGenerating(true);
      
      const response = await analyticsService.generateReport(config);
      
      // Create blob and download
      const blob = new Blob([response.data], {
        type: config.format === 'pdf' 
          ? 'application/pdf' 
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_report_${Date.now()}.${config.format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error generating report';
      toast.error(errorMessage);
      return false;
    } finally {
      setGenerating(false);
    }
  };

  const emailReport = async (config) => {
    try {
      setEmailing(true);
      
      await analyticsService.emailReport(config);
      toast.success('Report sent to your email');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error sending report';
      toast.error(errorMessage);
      return false;
    } finally {
      setEmailing(false);
    }
  };

  return {
    generateReport,
    emailReport,
    generating,
    emailing
  };
};
