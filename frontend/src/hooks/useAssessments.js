import { useState, useEffect } from 'react';
import { assessmentService } from '../services/assessmentService';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing assessments with filters, pagination, and search
 * @param {Object} initialFilters - Initial filter parameters
 * @returns {Object} - Assessments data and control functions
 */
export const useAssessments = (initialFilters = {}) => {
  const [assessments, setAssessments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    page: 1,
    limit: 9,
    search: '',
    subject: '',
    instructor: '',
    type: 'all',
    status: '',
    sort: 'recent',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  });

  /**
   * Fetch assessments from API
   */
  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const data = await assessmentService.getAssessments(params);
      setAssessments(data.data.assessments);
      setPagination(data.data.pagination);
      setFilters(data.data.filters);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch assessments');
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch assessments when params change
   */
  useEffect(() => {
    fetchAssessments();
  }, [JSON.stringify(params)]); // Use JSON.stringify to deep compare params

  /**
   * Update filter parameters (resets to page 1)
   * @param {Object} newParams - New parameters to merge
   */
  const updateParams = (newParams) => {
    setParams(prev => ({ ...prev, ...newParams, page: 1 }));
  };

  /**
   * Change current page
   * @param {number} page - Page number
   */
  const changePage = (page) => {
    setParams(prev => ({ ...prev, page }));
  };

  /**
   * Clear all filters and reset to defaults
   */
  const clearFilters = () => {
    setParams({
      page: 1,
      limit: 9,
      search: '',
      subject: '',
      instructor: '',
      type: 'all',
      status: '',
      sort: 'recent',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  /**
   * Manually refresh assessments
   */
  const refresh = () => {
    fetchAssessments();
  };

  return {
    assessments,
    pagination,
    filters,
    loading,
    params,
    updateParams,
    changePage,
    clearFilters,
    refresh
  };
};

export default useAssessments;
