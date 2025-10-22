import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for calendar functionality
 * Manages calendar state and operations
 */
const useCalendar = (userRole, userId) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({
    subject: 'all',
    status: 'all',
    priority: 'all',
  });

  /**
   * Get date range for current view
   */
  const getDateRange = useCallback(() => {
    const date = new Date(currentDate);
    let start, end;

    if (view === 'day') {
      start = new Date(date.setHours(0, 0, 0, 0));
      end = new Date(date.setHours(23, 59, 59, 999));
    } else if (view === 'week') {
      const day = date.getDay();
      start = new Date(date);
      start.setDate(date.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (view === 'month') {
      start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return { start, end };
  }, [currentDate, view]);

  /**
   * Fetch calendar events
   */
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { start, end } = getDateRange();
      let response;

      if (userRole === 'student') {
        response = await api.get(`/calendar/student/${userId}`, {
          params: {
            start: start.toISOString(),
            end: end.toISOString(),
            view,
          },
        });
      } else if (userRole === 'instructor') {
        response = await api.get(`/calendar/instructor/${userId}`, {
          params: {
            start: start.toISOString(),
            end: end.toISOString(),
            view,
          },
        });
      } else if (userRole === 'admin') {
        response = await api.get('/calendar/admin', {
          params: {
            start: start.toISOString(),
            end: end.toISOString(),
            view,
          },
        });
      }

      if (response?.data?.success) {
        setEvents(response.data.data.events);
        setFilteredEvents(response.data.data.events);
        setSummary(response.data.data.summary);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch calendar events');
      console.error('Calendar fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userRole, userId, view, getDateRange]);

  /**
   * Navigate to today
   */
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  /**
   * Navigate to previous period
   */
  const goToPrevious = useCallback(() => {
    const date = new Date(currentDate);
    
    if (view === 'day') {
      date.setDate(date.getDate() - 1);
    } else if (view === 'week') {
      date.setDate(date.getDate() - 7);
    } else if (view === 'month') {
      date.setMonth(date.getMonth() - 1);
    }

    setCurrentDate(date);
  }, [currentDate, view]);

  /**
   * Navigate to next period
   */
  const goToNext = useCallback(() => {
    const date = new Date(currentDate);
    
    if (view === 'day') {
      date.setDate(date.getDate() + 1);
    } else if (view === 'week') {
      date.setDate(date.getDate() + 7);
    } else if (view === 'month') {
      date.setMonth(date.getMonth() + 1);
    }

    setCurrentDate(date);
  }, [currentDate, view]);

  /**
   * Change calendar view
   */
  const changeView = useCallback((newView) => {
    if (['day', 'week', 'month'].includes(newView)) {
      setView(newView);
    }
  }, []);

  /**
   * Apply filters to events
   */
  const applyFilters = useCallback(() => {
    let filtered = [...events];

    if (filters.subject !== 'all') {
      filtered = filtered.filter((event) => event.subject === filters.subject);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((event) => event.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter((event) => event.priority === filters.priority);
    }

    setFilteredEvents(filtered);
  }, [events, filters]);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Update assessment date (instructor only)
   */
  const updateEventDate = useCallback(async (eventId, newDate, reason, notifyStudents = true) => {
    try {
      const response = await api.patch(`/calendar/assessment/${eventId}/date`, {
        newDate,
        reason,
        notifyStudents,
      });

      if (response?.data?.success) {
        // Refresh events
        await fetchEvents();
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      console.error('Update date error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update date',
      };
    }
  }, [fetchEvents]);

  /**
   * Export calendar to iCal
   */
  const exportToICal = useCallback(async () => {
    try {
      const { start, end } = getDateRange();
      const response = await api.get(`/calendar/export/${userId}`, {
        params: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `calendar_${new Date().toISOString().split('T')[0]}.ics`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (err) {
      console.error('Export error:', err);
      return {
        success: false,
        message: 'Failed to export calendar',
      };
    }
  }, [userId, getDateRange]);

  /**
   * Get events for a specific date
   */
  const getEventsForDate = useCallback((date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.date || event.deadline);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === targetDate.getTime();
    });
  }, [filteredEvents]);

  /**
   * Get current period label
   */
  const getPeriodLabel = useCallback(() => {
    const date = new Date(currentDate);

    if (view === 'day') {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (view === 'week') {
      const { start, end } = getDateRange();
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (view === 'month') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
    }
  }, [currentDate, view, getDateRange]);

  // Fetch events when date or view changes
  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
  }, [currentDate, view, userId, fetchEvents]);

  // Apply filters when events or filters change
  useEffect(() => {
    applyFilters();
  }, [events, filters, applyFilters]);

  return {
    // State
    currentDate,
    view,
    events: filteredEvents,
    allEvents: events,
    loading,
    error,
    summary,
    filters,

    // Actions
    goToToday,
    goToPrevious,
    goToNext,
    changeView,
    updateFilters,
    updateEventDate,
    exportToICal,
    getEventsForDate,
    getPeriodLabel,
    refreshEvents: fetchEvents,
  };
};

export default useCalendar;
