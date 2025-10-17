import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Grid, List } from 'lucide-react';
import { useAssessments } from '../../hooks/useAssessments';
import { useDebounce } from '../../hooks/useDebounce';
import FilterSidebar from '../../components/assessments/FilterSidebar';
import AssessmentCard from '../../components/assessments/AssessmentCard';
import AssessmentListItem from '../../components/assessments/AssessmentListItem';
import Pagination from '../../components/common/Pagination';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';

/**
 * UpcomingTestsPage Component
 * Browse and filter all available assessments with grid/list views
 */
const UpcomingTestsPage = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  const debouncedSearch = useDebounce(searchInput, 500);
  const {
    assessments,
    pagination,
    filters,
    loading,
    params,
    updateParams,
    changePage,
    clearFilters
  } = useAssessments();

  // Update search when debounced value changes
  useEffect(() => {
    updateParams({ search: debouncedSearch });
  }, [debouncedSearch]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Browse Assessments
        </h1>
        <p className="mt-2 text-gray-600">
          Find and start your upcoming assessments
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 border-l border-gray-300 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Filter Sidebar */}
        {(showFilters || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <FilterSidebar
            filters={filters}
            params={params}
            updateParams={updateParams}
            clearFilters={clearFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Assessment Grid/List */}
        <div className="flex-1">
          {loading ? (
            // Loading Skeletons
            <div className={`
              ${viewMode === 'grid'
                ? 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'
                : 'space-y-4'
              }
            `}>
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} variant="assessment" />
              ))}
            </div>
          ) : assessments.length === 0 ? (
            // Empty State
            <EmptyState
              icon="BookOpen"
              title="No Assessments Found"
              message="Try adjusting your filters or check back later for new assessments."
              action={{
                label: 'Clear Filters',
                onClick: clearFilters
              }}
            />
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {assessments.map((assessment) => (
                <AssessmentCard
                  key={assessment._id}
                  assessment={assessment}
                />
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <AssessmentListItem
                  key={assessment._id}
                  assessment={assessment}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && assessments.length > 0 && pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={changePage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingTestsPage;
