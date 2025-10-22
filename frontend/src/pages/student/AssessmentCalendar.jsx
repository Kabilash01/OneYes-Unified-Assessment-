import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useCalendar from '../../hooks/useCalendar';
import CalendarView from '../../components/common/CalendarView';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
  X,
  AlertCircle,
} from 'lucide-react';

const AssessmentCalendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    currentDate,
    view,
    events,
    loading,
    error,
    summary,
    filters,
    goToToday,
    goToPrevious,
    goToNext,
    changeView,
    updateFilters,
    exportToICal,
    getPeriodLabel,
  } = useCalendar('student', user?._id);

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uniqueSubjects, setUniqueSubjects] = useState([]);

  // Extract unique subjects from events
  useEffect(() => {
    const subjects = [...new Set(events.map((e) => e.subject).filter(Boolean))];
    setUniqueSubjects(subjects);
  }, [events]);

  // Filter events by search query
  const filteredEvents = events.filter((event) =>
    searchQuery
      ? event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  /**
   * Handle event click - navigate to assessment
   */
  const handleEventClick = (event) => {
    if (event.type === 'assessment') {
      navigate(`/student/assessments/${event.id}`);
    }
  };

  /**
   * Handle export to iCal
   */
  const handleExport = async () => {
    const result = await exportToICal();
    if (result.success) {
      alert('Calendar exported successfully!');
    } else {
      alert('Failed to export calendar');
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CalendarIcon className="mr-3 text-blue-600" size={28} />
              Assessment Calendar
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              View and manage your upcoming assessments
            </p>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{summary.pending}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.submitted}</div>
                <div className="text-xs text-gray-600">Submitted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.evaluated}</div>
                <div className="text-xs text-gray-600">Evaluated</div>
              </div>
              {summary.overdue > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{summary.overdue}</div>
                  <div className="text-xs text-gray-600">Overdue</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Today
            </button>

            <button
              onClick={goToNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next"
            >
              <ChevronRight size={20} />
            </button>

            <div className="text-lg font-semibold text-gray-900 ml-4">
              {getPeriodLabel()}
            </div>
          </div>

          {/* View Toggle & Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter size={18} className="mr-2" />
              Filters
            </button>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => changeView('month')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  view === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => changeView('week')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  view === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => changeView('day')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  view === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Day
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
              title="Export to Google Calendar / iCal"
            >
              <Download size={18} className="mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={filters.subject}
                  onChange={(e) => updateFilters({ subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Subjects</option>
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="evaluated">Evaluated</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => updateFilters({ priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.subject !== 'all' || filters.status !== 'all' || filters.priority !== 'all') && (
              <div className="mt-3 flex items-center space-x-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.subject !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Subject: {filters.subject}
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Status: {filters.status}
                  </span>
                )}
                {filters.priority !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Priority: {filters.priority}
                  </span>
                )}
                <button
                  onClick={() => updateFilters({ subject: 'all', status: 'all', priority: 'all' })}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Calendar View */}
      <div className="flex-1 overflow-hidden p-6">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          </div>
        ) : (
          <CalendarView
            events={filteredEvents}
            view={view}
            currentDate={currentDate}
            onEventClick={handleEventClick}
            userRole="student"
            editable={false}
          />
        )}
      </div>

      {/* Color Legend */}
      <div className="bg-white border-t px-6 py-3">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-red-500 mr-2"></div>
            <span className="text-gray-700">Overdue</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-orange-500 mr-2"></div>
            <span className="text-gray-700">Due Soon (&lt;24h)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-gray-500 mr-2"></div>
            <span className="text-gray-700">Upcoming</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-blue-500 mr-2"></div>
            <span className="text-gray-700">Submitted</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
            <span className="text-gray-700">Evaluated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCalendar;
