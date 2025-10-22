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
  TrendingUp,
  Users,
  FileText,
  Activity,
} from 'lucide-react';

const ActivityCalendar = () => {
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
  } = useCalendar('admin', user?._id);

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');

  // Filter events by search query and type
  const filteredEvents = events.filter((event) => {
    const matchesSearch = searchQuery
      ? event.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesType = eventTypeFilter === 'all' || event.type === eventTypeFilter;
    
    return matchesSearch && matchesType;
  });

  /**
   * Handle event click - navigate based on type
   */
  const handleEventClick = (event) => {
    switch (event.type) {
      case 'registration':
        navigate('/admin/users');
        break;
      case 'assessment_created':
        navigate('/admin/assessments');
        break;
      case 'announcement':
        navigate('/admin/announcements');
        break;
      case 'activity':
        navigate('/admin/activity-logs');
        break;
      default:
        break;
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
   * Get event type icon
   */
  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'registration':
        return <Users size={16} className="text-blue-600" />;
      case 'assessment_created':
        return <FileText size={16} className="text-green-600" />;
      case 'announcement':
        return <Activity size={16} className="text-purple-600" />;
      case 'activity':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <CalendarIcon size={16} className="text-gray-600" />;
    }
  };

  /**
   * Calculate summary statistics
   */
  const calculateStats = () => {
    const totalEvents = events.length;
    const registrations = events.filter(e => e.type === 'registration').reduce((sum, e) => sum + (e.count || 0), 0);
    const assessmentsCreated = events.filter(e => e.type === 'assessment_created').reduce((sum, e) => sum + (e.count || 0), 0);
    const announcements = events.filter(e => e.type === 'announcement').length;
    const activities = events.filter(e => e.type === 'activity').reduce((sum, e) => sum + (e.count || 0), 0);

    return {
      totalEvents,
      registrations,
      assessmentsCreated,
      announcements,
      activities,
    };
  };

  const stats = calculateStats();

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <CalendarIcon className="mr-3" size={28} />
              Platform Activity Calendar
            </h1>
            <p className="text-indigo-100 text-sm mt-1">
              Monitor platform-wide events, registrations, and activities
            </p>
          </div>

          {/* Trends */}
          {summary?.trends && (
            <div className="flex items-center space-x-6 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <div className="flex items-center">
                <TrendingUp size={20} className="mr-2 text-green-300" />
                <div>
                  <div className="text-xs text-indigo-100">User Growth</div>
                  <div className="text-lg font-bold">{summary.trends.userGrowth}</div>
                </div>
              </div>
              <div className="flex items-center">
                <FileText size={20} className="mr-2 text-blue-300" />
                <div>
                  <div className="text-xs text-indigo-100">Assessment Growth</div>
                  <div className="text-lg font-bold">{summary.trends.assessmentGrowth}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Activity size={20} className="mr-2 text-yellow-300" />
                <div>
                  <div className="text-xs text-indigo-100">Total Events</div>
                  <div className="text-lg font-bold">{summary.trends.totalEventsInRange}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="text-blue-600 mr-2" size={20} />
              <span className="text-2xl font-bold text-blue-600">{stats.registrations}</span>
            </div>
            <div className="text-xs text-gray-600">New Users</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <FileText className="text-green-600 mr-2" size={20} />
              <span className="text-2xl font-bold text-green-600">{stats.assessmentsCreated}</span>
            </div>
            <div className="text-xs text-gray-600">Assessments Created</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Activity className="text-purple-600 mr-2" size={20} />
              <span className="text-2xl font-bold text-purple-600">{stats.announcements}</span>
            </div>
            <div className="text-xs text-gray-600">Announcements</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <AlertCircle className="text-red-600 mr-2" size={20} />
              <span className="text-2xl font-bold text-red-600">{stats.activities}</span>
            </div>
            <div className="text-xs text-gray-600">Important Events</div>
          </div>
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
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
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>

            {/* Event Type Filter */}
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Events</option>
              <option value="registration">User Registrations</option>
              <option value="assessment_created">Assessments Created</option>
              <option value="announcement">Announcements</option>
              <option value="activity">Important Activities</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => changeView('month')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  view === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => changeView('week')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  view === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => changeView('day')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  view === 'day' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Day
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
              title="Export Calendar Data"
            >
              <Download size={18} className="mr-2" />
              Export
            </button>
          </div>
        </div>
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
            userRole="admin"
            editable={false}
          />
        )}
      </div>

      {/* Color Legend */}
      <div className="bg-white border-t px-6 py-3">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-blue-500 mr-2"></div>
            <span className="text-gray-700">User Registrations</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
            <span className="text-gray-700">Assessments Created</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-purple-500 mr-2"></div>
            <span className="text-gray-700">Announcements</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-red-500 mr-2"></div>
            <span className="text-gray-700">Important Activities</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-orange-500 mr-2"></div>
            <span className="text-gray-700">High Priority</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCalendar;
