import React, { useState, useEffect } from 'react';
import { Grid, List, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FilterSidebar from '../../components/common/FilterSidebar';
import AssessmentCard from '../../components/common/AssessmentCard';
import { SkeletonGrid } from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { useFilters } from '../../hooks/useFilters';
import { useStudentDashboard } from '../../hooks/useStudentDashboard';
import { useNavigate } from 'react-router-dom';

/**
 * Upcoming Tests Page (Assessment Catalog)
 * Browse and filter all available assessments
 */
const UpcomingTestsPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    setPage,
    hasActiveFilters,
    getActiveFilterCount
  } = useFilters();

  const { assessments, loading, error, fetchAssessments } = useStudentDashboard();

  // Fetch assessments when filters change
  useEffect(() => {
    fetchAssessments(filters);
  }, [filters]);

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      updateFilter('search', value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Handle filter apply
  const handleApplyFilters = () => {
    fetchAssessments(filters);
  };

  // Handle assessment actions
  const handleStartAssessment = (assessmentId) => {
    navigate(`/student/test/${assessmentId}`);
  };

  const handleViewDetails = (assessmentId) => {
    navigate(`/student/assessment/${assessmentId}`);
  };

  // Mock data for filters (would come from API)
  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'History',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology'
  ];

  const instructors = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      avatar: null
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      avatar: null
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      avatar: null
    },
    {
      id: '4',
      name: 'Prof. David Kim',
      avatar: null
    }
  ];

  // Pagination
  const totalPages = Math.ceil((assessments?.total || 0) / filters.limit);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Filter Sidebar */}
        <div className="w-80 flex-shrink-0 border-r bg-white overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Filters
              {hasActiveFilters() && (
                <span className="ml-2 text-sm font-medium text-blue-600">
                  ({getActiveFilterCount()})
                </span>
              )}
            </h2>
            
            <FilterSidebar
              filters={filters}
              onFilterChange={updateFilter}
              onApply={handleApplyFilters}
              onClear={clearFilters}
              subjects={subjects}
              instructors={instructors}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Upcoming Tests
              </h1>
              <p className="text-gray-600">
                Browse and take your scheduled assessments
              </p>
            </div>

            {/* Search and View Toggle */}
            <div className="bg-white rounded-xl border p-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assessments by title, subject, or instructor..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full h-12 pl-12 pr-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      view === 'grid'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-md transition-colors ${
                      view === 'list'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    aria-label="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters() && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {getActiveFilterCount()} filter(s) applied
                    </span>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            {loading ? (
              <SkeletonGrid count={filters.limit} />
            ) : error ? (
              <EmptyState
                variant="error"
                title="Failed to load assessments"
                message={error}
                actionLabel="Try Again"
                onAction={() => fetchAssessments(filters)}
              />
            ) : assessments?.data?.length === 0 ? (
              <EmptyState
                variant={hasActiveFilters() ? 'search' : 'assessments'}
                title={hasActiveFilters() ? 'No matching assessments' : 'No assessments found'}
                message={
                  hasActiveFilters()
                    ? 'Try adjusting your filters or search query'
                    : "You don't have any scheduled assessments yet"
                }
                actionLabel={hasActiveFilters() ? 'Clear Filters' : undefined}
                onAction={hasActiveFilters() ? clearFilters : undefined}
              />
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Showing {assessments?.data?.length || 0} of {assessments?.total || 0} assessments
                  </p>
                </div>

                {/* Assessment Grid/List */}
                <div
                  className={
                    view === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {assessments?.data?.map((assessment) => (
                    <AssessmentCard
                      key={assessment._id}
                      assessment={assessment}
                      variant={view}
                      onStart={() => handleStartAssessment(assessment._id)}
                      onView={() => handleViewDetails(assessment._id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= filters.page - 1 && page <= filters.page + 1);

                        if (!showPage) {
                          // Show ellipsis
                          if (page === filters.page - 2 || page === filters.page + 2) {
                            return (
                              <span key={page} className="px-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              page === filters.page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UpcomingTestsPage;
