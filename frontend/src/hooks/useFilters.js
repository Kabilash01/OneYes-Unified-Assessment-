import { useState, useCallback } from 'react';

/**
 * Custom hook for managing filter state
 * Provides filter state and actions for assessment filtering
 */
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    subject: '',
    instructor: '',
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    duration: { min: 0, max: 180 },
    search: '',
    sortBy: 'recent',
    sortOrder: 'desc',
    page: 1,
    limit: 9,
    ...initialFilters
  });

  /**
   * Update a single filter
   */
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : prev.page // Reset page when filter changes
    }));
  }, []);

  /**
   * Update multiple filters at once
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset page when filters change
    }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      subject: '',
      instructor: '',
      type: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      duration: { min: 0, max: 180 },
      search: '',
      sortBy: 'recent',
      sortOrder: 'desc',
      page: 1,
      limit: 9
    });
  }, []);

  /**
   * Clear a single filter
   */
  const clearFilter = useCallback((key) => {
    const defaultValues = {
      subject: '',
      instructor: '',
      type: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      duration: { min: 0, max: 180 },
      search: ''
    };
    
    if (key in defaultValues) {
      setFilters(prev => ({
        ...prev,
        [key]: defaultValues[key],
        page: 1
      }));
    }
  }, []);

  /**
   * Set page
   */
  const setPage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  /**
   * Set sort
   */
  const setSort = useCallback((sortBy, sortOrder = 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  }, []);

  /**
   * Check if any filters are active (excluding pagination and sort)
   */
  const hasActiveFilters = useCallback(() => {
    const { page, limit, sortBy, sortOrder, duration, ...restFilters } = filters;
    const hasDurationFilter = duration.min !== 0 || duration.max !== 180;
    const hasOtherFilters = Object.values(restFilters).some(value => 
      value !== '' && value !== null && value !== undefined
    );
    return hasDurationFilter || hasOtherFilters;
  }, [filters]);

  /**
   * Get active filter count
   */
  const getActiveFilterCount = useCallback(() => {
    const { page, limit, sortBy, sortOrder, duration, ...restFilters } = filters;
    let count = 0;
    
    // Count duration filter if not default
    if (duration.min !== 0 || duration.max !== 180) {
      count++;
    }
    
    // Count other filters
    count += Object.values(restFilters).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
    
    return count;
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    setPage,
    setSort,
    hasActiveFilters,
    getActiveFilterCount
  };
};

export default useFilters;
