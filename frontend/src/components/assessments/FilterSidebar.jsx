import React from 'react';
import { X, Calendar, Users, FileType, CheckCircle, ArrowUpDown } from 'lucide-react';

/**
 * FilterSidebar Component
 * Sidebar with filters for assessments
 * @param {Object} filters - Available filter options from API
 * @param {Object} params - Current filter parameters
 * @param {function} updateParams - Function to update filter parameters
 * @param {function} clearFilters - Function to clear all filters
 * @param {function} onClose - Function to close sidebar (mobile)
 */
const FilterSidebar = ({ filters, params, updateParams, clearFilters, onClose }) => {
  return (
    <aside className="w-full lg:w-64 lg:shrink-0">
      <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600 lg:hidden"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Subject Filter */}
        <div className="mb-6">
          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
            <FileType className="h-4 w-4" />
            Subject
          </label>
          <select
            value={params.subject || ''}
            onChange={(e) => updateParams({ subject: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            {filters.subjects?.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Instructor Filter */}
        <div className="mb-6">
          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Users className="h-4 w-4" />
            Instructor
          </label>
          <select
            value={params.instructor || ''}
            onChange={(e) => updateParams({ instructor: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Instructors</option>
            {filters.instructors?.map((instructor) => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="mb-6">
          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
            <FileType className="h-4 w-4" />
            Assessment Type
          </label>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Types' },
              { value: 'mcq-only', label: 'MCQ Only' },
              { value: 'written', label: 'Written Only' },
              { value: 'mixed', label: 'Mixed' }
            ].map((type) => (
              <label key={type.value} className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={params.type === type.value}
                  onChange={(e) => updateParams({ type: e.target.value })}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {type.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
            <CheckCircle className="h-4 w-4" />
            Status
          </label>
          <div className="space-y-2">
            {[
              { value: '', label: 'All Status' },
              { value: 'available', label: 'Available Now' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'completed', label: 'Completed' }
            ].map((statusOption) => (
              <label key={statusOption.value} className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="status"
                  checked={params.status === statusOption.value}
                  onChange={() => updateParams({ status: statusOption.value })}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {statusOption.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div className="mb-6">
          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
            <ArrowUpDown className="h-4 w-4" />
            Sort By
          </label>
          <select
            value={params.sort || 'recent'}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Newest First</option>
            <option value="alphabetical">Title A-Z</option>
            <option value="duration">Duration</option>
            <option value="startDate">Start Date</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={clearFilters}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Clear All Filters
        </button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
