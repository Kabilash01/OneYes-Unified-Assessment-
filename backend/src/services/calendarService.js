/**
 * Calendar Service
 * Utility functions for calendar operations
 */

/**
 * Aggregate events by date
 * @param {Array} events - Array of events
 * @param {String} groupBy - 'day', 'week', 'month'
 * @returns {Object} Grouped events
 */
const aggregateEventsByDate = (events, groupBy = 'day') => {
  const grouped = {};

  events.forEach((event) => {
    let key;
    const date = new Date(event.date || event.deadline || event.createdAt);

    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(event);
  });

  return grouped;
};

/**
 * Calculate countdown from now to target date
 * @param {Date} targetDate - Target date
 * @returns {Object} Countdown object with days, hours, minutes
 */
const calculateCountdown = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target - now;

  if (diff < 0) {
    return { days: 0, hours: 0, minutes: 0, isOverdue: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, isOverdue: false };
};

/**
 * Generate color based on subject
 * @param {String} subject - Subject name
 * @returns {String} Hex color code
 */
const generateColorBySubject = (subject) => {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#14B8A6', // Teal
    '#F97316', // Dark Orange
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#84CC16', // Lime
  ];

  if (!subject) return '#6B7280'; // Gray default

  // Generate consistent color based on subject string
  const hash = subject.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

/**
 * Generate color based on priority
 * @param {String} priority - Priority level
 * @returns {String} Hex color code
 */
const generateColorByPriority = (priority) => {
  const priorityColors = {
    critical: '#DC2626', // Dark Red
    high: '#EF4444', // Red
    medium: '#F59E0B', // Orange
    low: '#3B82F6', // Blue
  };

  return priorityColors[priority] || '#6B7280'; // Gray default
};

/**
 * Generate color based on status and deadline
 * @param {String} status - Current status
 * @param {Date} deadline - Deadline date
 * @returns {String} Hex color code
 */
const generateColorByStatus = (status, deadline) => {
  if (status === 'evaluated' || status === 'completed') {
    return '#10B981'; // Green
  }

  if (status === 'submitted') {
    return '#3B82F6'; // Blue
  }

  // Check if overdue or due soon
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const hoursUntilDeadline = (deadlineDate - now) / (1000 * 60 * 60);

  if (hoursUntilDeadline < 0) {
    return '#EF4444'; // Red (overdue)
  }

  if (hoursUntilDeadline < 24) {
    return '#F59E0B'; // Orange (due soon)
  }

  return '#6B7280'; // Gray (upcoming)
};

/**
 * Format event for calendar display
 * @param {Object} event - Event object
 * @param {String} type - Event type (assessment, announcement, etc.)
 * @returns {Object} Formatted event
 */
const formatEventForCalendar = (event, type = 'assessment') => {
  let formattedEvent = {
    id: event._id,
    type,
    title: event.title || event.name || 'Untitled',
    date: event.deadline || event.startDate || event.createdAt,
  };

  if (type === 'assessment') {
    formattedEvent = {
      ...formattedEvent,
      subject: event.subject,
      duration: event.duration,
      totalMarks: event.totalMarks,
      status: event.submissionStatus || 'pending',
      priority: event.priority || 'medium',
      color: generateColorByStatus(event.submissionStatus, event.deadline),
      countdown: calculateCountdown(event.deadline),
      isPublished: event.isPublished,
      deadline: event.deadline,
    };
  } else if (type === 'announcement') {
    formattedEvent = {
      ...formattedEvent,
      message: event.message,
      priority: event.priority,
      color: generateColorByPriority(event.priority),
      isPinned: event.isPinned,
    };
  } else if (type === 'registration') {
    formattedEvent = {
      ...formattedEvent,
      count: event.count,
      color: '#3B82F6',
    };
  }

  return formattedEvent;
};

/**
 * Generate iCal file content
 * @param {Array} events - Array of events
 * @param {Object} userInfo - User information
 * @returns {String} iCal format string
 */
const generateICalFile = (events, userInfo = {}) => {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OneYes Assessment Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${userInfo.name || 'My'} Assessment Calendar`,
    'X-WR-TIMEZONE:UTC',
  ];

  events.forEach((event) => {
    const startDate = new Date(event.date || event.deadline);
    const endDate = new Date(startDate.getTime() + (event.duration || 60) * 60000); // Add duration in minutes

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    ical.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@oneyes.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.subject || event.message || 'Assessment event'}`,
      `STATUS:CONFIRMED`,
      `SEQUENCE:0`,
      `PRIORITY:${event.priority === 'high' ? '1' : event.priority === 'medium' ? '5' : '9'}`,
      'END:VEVENT'
    );
  });

  ical.push('END:VCALENDAR');

  return ical.join('\r\n');
};

/**
 * Get date range for a view type
 * @param {Date} currentDate - Current date
 * @param {String} viewType - 'month', 'week', 'day'
 * @returns {Object} Start and end dates
 */
const getDateRangeForView = (currentDate, viewType = 'month') => {
  const date = new Date(currentDate);
  let start, end;

  if (viewType === 'day') {
    start = new Date(date.setHours(0, 0, 0, 0));
    end = new Date(date.setHours(23, 59, 59, 999));
  } else if (viewType === 'week') {
    const day = date.getDay();
    start = new Date(date);
    start.setDate(date.getDate() - day);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (viewType === 'month') {
    start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return { start, end };
};

/**
 * Check if date is in range
 * @param {Date} date - Date to check
 * @param {Date} start - Range start
 * @param {Date} end - Range end
 * @returns {Boolean}
 */
const isDateInRange = (date, start, end) => {
  const checkDate = new Date(date);
  return checkDate >= start && checkDate <= end;
};

module.exports = {
  aggregateEventsByDate,
  calculateCountdown,
  generateColorBySubject,
  generateColorByPriority,
  generateColorByStatus,
  formatEventForCalendar,
  generateICalFile,
  getDateRangeForView,
  isDateInRange,
};
