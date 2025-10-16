import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import Button from './Button';

/**
 * Filter Sidebar Component
 * Provides filtering options for assessments
 */
const FilterSidebar = ({ 
  filters, 
  onFilterChange, 
  onApply, 
  onClear,
  subjects = [],
  instructors = [],
  className = '' 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    subject: true,
    instructor: true,
    type: true,
    status: true,
    date: false,
    duration: false
  });

  const [instructorSearch, setInstructorSearch] = useState('');

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubjectChange = (subject) => {
    const currentSubjects = filters.subject ? filters.subject.split(',') : [];
    let newSubjects;
    
    if (currentSubjects.includes(subject)) {
      newSubjects = currentSubjects.filter(s => s !== subject);
    } else {
      newSubjects = [...currentSubjects, subject];
    }
    
    onFilterChange('subject', newSubjects.join(','));
  };

  const isSubjectSelected = (subject) => {
    const currentSubjects = filters.subject ? filters.subject.split(',') : [];
    return currentSubjects.includes(subject);
  };

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(instructorSearch.toLowerCase())
  );

  const assessmentTypes = [
    { value: '', label: 'All Types' },
    { value: 'mcq', label: 'MCQ Only' },
    { value: 'written', label: 'Written Only' },
    { value: 'mixed', label: 'Mixed' }
  ];

  const statusOptions = [
    { value: 'available', label: 'Available Now' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
    { value: 'missed', label: 'Missed' }
  ];

  const FilterSection = ({ title, isExpanded, onToggle, children }) => (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-2 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
      >
        <span>{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {isExpanded && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {(filters.subject || filters.instructor || filters.type || filters.status) && (
          <button
            onClick={onClear}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Subject Filter */}
        <FilterSection
          title="Subject"
          isExpanded={expandedSections.subject}
          onToggle={() => toggleSection('subject')}
        >
          {subjects.map((subject) => (
            <label key={subject} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={isSubjectSelected(subject)}
                onChange={() => handleSubjectChange(subject)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                {subject}
              </span>
            </label>
          ))}
        </FilterSection>

        {/* Instructor Filter */}
        <FilterSection
          title="Instructor"
          isExpanded={expandedSections.instructor}
          onToggle={() => toggleSection('instructor')}
        >
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search instructor..."
              value={instructorSearch}
              onChange={(e) => setInstructorSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Instructor List */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredInstructors.map((instructor) => (
              <label key={instructor._id} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="instructor"
                  checked={filters.instructor === instructor._id}
                  onChange={() => onFilterChange('instructor', instructor._id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-2 flex items-center gap-2">
                  {instructor.profilePic ? (
                    <img
                      src={instructor.profilePic}
                      alt={instructor.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs text-blue-600 font-medium">
                        {instructor.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    {instructor.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Assessment Type Filter */}
        <FilterSection
          title="Assessment Type"
          isExpanded={expandedSections.type}
          onToggle={() => toggleSection('type')}
        >
          {assessmentTypes.map((type) => (
            <label key={type.value} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="type"
                checked={filters.type === type.value}
                onChange={() => onFilterChange('type', type.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                {type.label}
              </span>
            </label>
          ))}
        </FilterSection>

        {/* Status Filter */}
        <FilterSection
          title="Status"
          isExpanded={expandedSections.status}
          onToggle={() => toggleSection('status')}
        >
          {statusOptions.map((status) => (
            <label key={status.value} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.status?.includes(status.value)}
                onChange={(e) => {
                  const currentStatus = filters.status ? filters.status.split(',') : [];
                  let newStatus;
                  if (e.target.checked) {
                    newStatus = [...currentStatus, status.value];
                  } else {
                    newStatus = currentStatus.filter(s => s !== status.value);
                  }
                  onFilterChange('status', newStatus.join(','));
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                {status.label}
              </span>
            </label>
          ))}
        </FilterSection>

        {/* Date Range Filter */}
        <FilterSection
          title="Date Range"
          isExpanded={expandedSections.date}
          onToggle={() => toggleSection('date')}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => onFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                onFilterChange('dateFrom', today);
                onFilterChange('dateTo', today);
              }}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                onFilterChange('dateFrom', today.toISOString().split('T')[0]);
                onFilterChange('dateTo', weekLater.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              This Week
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const monthLater = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
                onFilterChange('dateFrom', today.toISOString().split('T')[0]);
                onFilterChange('dateTo', monthLater.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              This Month
            </button>
          </div>
        </FilterSection>

        {/* Duration Filter */}
        <FilterSection
          title="Duration"
          isExpanded={expandedSections.duration}
          onToggle={() => toggleSection('duration')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{filters.duration?.min || 0} min</span>
              <span>{filters.duration?.max || 180} min</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="15"
              value={filters.duration?.max || 180}
              onChange={(e) => onFilterChange('duration', {
                min: filters.duration?.min || 0,
                max: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </FilterSection>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-2">
        <Button
          onClick={onApply}
          variant="primary"
          className="w-full"
        >
          Apply Filters
        </Button>
        <Button
          onClick={onClear}
          variant="outline"
          className="w-full"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
