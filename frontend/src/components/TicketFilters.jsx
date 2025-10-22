import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

/**
 * TicketFilters Component
 * Filter controls for ticket list
 * 
 * Props:
 * - filters: Current filter values
 * - onFilterChange: Callback when filters change
 * - currentUser: Logged in user
 */
const TicketFilters = ({ filters = {}, onFilterChange, currentUser }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  /**
   * Handle search input change with debounce
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      onFilterChange?.({ ...filters, search: value });
    }, 500);
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (key, value) => {
    onFilterChange?.({ ...filters, [key]: value });
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setSearchInput('');
    onFilterChange?.({
      status: '',
      subject: '',
      priority: '',
      search: '',
      assignedTo: ''
    });
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = () => {
    return filters.subject || filters.priority || filters.search || filters.assignedTo;
  };

  /**
   * Get subject options
   */
  const subjectOptions = [
    { value: '', label: 'All Categories' },
    { value: 'technical', label: '🔧 Technical Support' },
    { value: 'billing', label: '💳 Billing & Payments' },
    { value: 'account', label: '👤 Account Issues' },
    { value: 'feature-request', label: '✨ Feature Request' },
    { value: 'bug-report', label: '🐛 Bug Report' },
    { value: 'other', label: '📝 Other' }
  ];

  /**
   * Get priority options
   */
  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  /**
   * Get assignment options (for instructors/admins)
   */
  const assignmentOptions = [
    { value: '', label: 'All Tickets' },
    { value: 'me', label: 'Assigned to Me' },
    { value: 'unassigned', label: 'Unassigned' }
  ];

  const showAssignmentFilter = currentUser?.role === 'instructor' || currentUser?.role === 'admin';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Main filters */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search tickets by title, message, or ticket number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                handleFilterChange('search', '');
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="relative min-w-[200px]">
          <select
            value={filters.subject || ''}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
          >
            {subjectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Priority filter */}
        <div className="relative min-w-[180px]">
          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-4 py-2 border rounded-lg transition flex items-center space-x-2 ${
            showAdvanced
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {/* Clear filters */}
        {hasActiveFilters() && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Assignment filter (instructors/admins only) */}
            {showAssignmentFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment
                </label>
                <select
                  value={filters.assignedTo || ''}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {assignmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort by */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'updatedAt'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Date Created</option>
                <option value="priority">Priority</option>
                <option value="ticketNumber">Ticket Number</option>
              </select>
            </div>

            {/* Sort order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            
            {filters.search && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center space-x-2">
                <span>Search: "{filters.search}"</span>
                <button
                  onClick={() => {
                    setSearchInput('');
                    handleFilterChange('search', '');
                  }}
                  className="hover:bg-indigo-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.subject && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center space-x-2">
                <span>Category: {subjectOptions.find(o => o.value === filters.subject)?.label}</span>
                <button
                  onClick={() => handleFilterChange('subject', '')}
                  className="hover:bg-indigo-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.priority && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center space-x-2">
                <span>Priority: {priorityOptions.find(o => o.value === filters.priority)?.label}</span>
                <button
                  onClick={() => handleFilterChange('priority', '')}
                  className="hover:bg-indigo-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.assignedTo && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center space-x-2">
                <span>Assignment: {assignmentOptions.find(o => o.value === filters.assignedTo)?.label}</span>
                <button
                  onClick={() => handleFilterChange('assignedTo', '')}
                  className="hover:bg-indigo-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketFilters;
