import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useCalendar from '../../hooks/useCalendar';
import CalendarView from '../../components/common/CalendarView';
import InstructorSidebar from '../../components/instructor/InstructorSidebar';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
  X,
  AlertCircle,
  Edit,
  Save,
  XCircle,
} from 'lucide-react';
import api from '../../services/api';

const EvaluationCalendar = () => {
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
    updateEventDate,
    refreshEvents,
  } = useCalendar('instructor', user?._id);

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uniqueSubjects, setUniqueSubjects] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    newDate: '',
    reason: '',
    notifyStudents: true,
  });

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
   * Handle event click - navigate to assessment or evaluation
   */
  const handleEventClick = (event) => {
    if (event.type === 'assessment') {
      if (event.pendingEvaluations > 0) {
        navigate(`/instructor/evaluate/${event.id}`);
      } else {
        navigate(`/instructor/assessments/${event.id}`);
      }
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

  /**
   * Start editing event date
   */
  const startEditingDate = (event) => {
    setEditingEvent(event);
    setRescheduleData({
      newDate: new Date(event.deadline).toISOString().slice(0, 16),
      reason: '',
      notifyStudents: true,
    });
  };

  /**
   * Cancel editing
   */
  const cancelEditing = () => {
    setEditingEvent(null);
    setRescheduleData({
      newDate: '',
      reason: '',
      notifyStudents: true,
    });
  };

  /**
   * Save rescheduled date
   */
  const saveReschedule = async () => {
    if (!rescheduleData.newDate || !rescheduleData.reason) {
      alert('Please provide new date and reason');
      return;
    }

    const result = await updateEventDate(
      editingEvent.id,
      rescheduleData.newDate,
      rescheduleData.reason,
      rescheduleData.notifyStudents
    );

    if (result.success) {
      alert('Assessment rescheduled successfully! Students have been notified.');
      cancelEditing();
    } else {
      alert(result.message || 'Failed to reschedule assessment');
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
    <div className="flex h-screen bg-gray-50">
      <InstructorSidebar />
      <div className="flex-1 overflow-auto">
        <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CalendarIcon className="mr-3 text-purple-600" size={28} />
              Evaluation Calendar
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage assessment deadlines and pending evaluations
            </p>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{summary.totalAssessments}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{summary.pendingEvaluations}</div>
                <div className="text-xs text-gray-600">Pending Evals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.completedEvaluations}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.publishedAssessments}</div>
                <div className="text-xs text-gray-600">Published</div>
              </div>
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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                showFilters ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  view === 'month' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => changeView('week')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  view === 'week' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => changeView('day')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  view === 'day' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'
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

            <div className="grid grid-cols-2 gap-4">
              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={filters.subject}
                  onChange={(e) => updateFilters({ subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  Evaluation Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All</option>
                  <option value="pending">Has Pending Evaluations</option>
                  <option value="completed">All Evaluated</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reschedule Assessment</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Assessment:</p>
              <p className="font-semibold text-gray-900">{editingEvent.title}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Deadline *
              </label>
              <input
                type="datetime-local"
                value={rescheduleData.newDate}
                onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rescheduling *
              </label>
              <textarea
                value={rescheduleData.reason}
                onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                placeholder="e.g., Extended due to holidays"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rescheduleData.notifyStudents}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, notifyStudents: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Notify all students about the change</span>
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={saveReschedule}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center"
              >
                <Save size={18} className="mr-2" />
                Save Changes
              </button>
              <button
                onClick={cancelEditing}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center"
              >
                <XCircle size={18} className="mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View with Edit Buttons */}
      <div className="flex-1 overflow-hidden p-6">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          </div>
        ) : (
          <div className="h-full relative">
            <CalendarView
              events={filteredEvents.map(event => ({
                ...event,
                customActions: (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingDate(event);
                    }}
                    className="ml-2 p-1 hover:bg-white rounded transition-colors"
                    title="Reschedule"
                  >
                    <Edit size={14} />
                  </button>
                ),
              }))}
              view={view}
              currentDate={currentDate}
              onEventClick={handleEventClick}
              userRole="instructor"
              editable={true}
            />
          </div>
        )}
      </div>

      {/* Color Legend */}
      <div className="bg-white border-t px-6 py-3">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
            <span className="text-gray-700">All Evaluated</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-orange-500 mr-2"></div>
            <span className="text-gray-700">Pending Evaluations</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-gray-500 mr-2"></div>
            <span className="text-gray-700">Draft/Unpublished</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-blue-500 mr-2"></div>
            <span className="text-gray-700">Active</span>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

export default EvaluationCalendar;
