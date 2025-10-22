import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  Megaphone,
  Activity,
} from 'lucide-react';

/**
 * Universal Calendar Component
 * Supports month, week, and day views with customizable event rendering
 */
const CalendarView = ({
  events = [],
  view = 'month',
  currentDate = new Date(),
  onEventClick,
  onDateClick,
  userRole = 'student',
  editable = false,
  onEventDragDrop,
}) => {
  const [hoveredEvent, setHoveredEvent] = useState(null);

  /**
   * Get icon for event type
   */
  const getEventIcon = (type) => {
    const icons = {
      assessment: FileText,
      user: User,
      announcement: Megaphone,
      registration: User,
      assessment_created: FileText,
      activity: Activity,
    };

    const Icon = icons[type] || CalendarIcon;
    return <Icon size={16} />;
  };

  /**
   * Get days in month
   */
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty days for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        date: prevMonthDate,
        isCurrentMonth: false,
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    // Add empty days for next month to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  /**
   * Get days in week
   */
  const getDaysInWeek = (date) => {
    const days = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push({
        date: day,
        isCurrentMonth: true,
      });
    }

    return days;
  };

  /**
   * Get events for a specific date
   */
  const getEventsForDate = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return events.filter((event) => {
      const eventDate = new Date(event.date || event.deadline);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === targetDate.getTime();
    });
  };

  /**
   * Check if date is today
   */
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  /**
   * Format countdown
   */
  const formatCountdown = (countdown) => {
    if (countdown.isOverdue) {
      return <span className="text-red-600 font-semibold">Overdue</span>;
    }

    if (countdown.days > 0) {
      return (
        <span className="text-gray-600">
          {countdown.days}d {countdown.hours}h
        </span>
      );
    }

    if (countdown.hours > 0) {
      return (
        <span className="text-orange-600 font-semibold">
          {countdown.hours}h {countdown.minutes}m
        </span>
      );
    }

    return (
      <span className="text-red-600 font-semibold">
        {countdown.minutes}m
      </span>
    );
  };

  /**
   * Render event card
   */
  const EventCard = ({ event, compact = false }) => {
    const handleClick = () => {
      if (onEventClick) {
        onEventClick(event);
      }
    };

    return (
      <div
        className={`rounded-lg p-2 mb-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
          compact ? 'text-xs' : 'text-sm'
        }`}
        style={{
          backgroundColor: `${event.color}20`,
          borderLeft: `3px solid ${event.color}`,
        }}
        onClick={handleClick}
        onMouseEnter={() => setHoveredEvent(event.id)}
        onMouseLeave={() => setHoveredEvent(null)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <span style={{ color: event.color }} className="mr-2 flex-shrink-0">
              {getEventIcon(event.type)}
            </span>
            <span className="font-medium truncate">{event.title}</span>
          </div>
          {event.badge && (
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
              style={{
                backgroundColor: event.badge.color,
                color: '#fff',
              }}
            >
              {event.badge.count || event.badge.label}
            </span>
          )}
        </div>

        {!compact && event.countdown && (
          <div className="flex items-center mt-1 text-xs">
            <Clock size={12} className="mr-1" />
            {formatCountdown(event.countdown)}
          </div>
        )}

        {!compact && event.subject && (
          <div className="mt-1 text-xs text-gray-600">
            📚 {event.subject}
          </div>
        )}

        {!compact && userRole === 'student' && event.status && (
          <div className="flex items-center mt-1 text-xs">
            {event.status === 'evaluated' && (
              <>
                <CheckCircle size={12} className="mr-1 text-green-600" />
                <span className="text-green-600">Evaluated</span>
                {event.score !== null && (
                  <span className="ml-2 font-semibold">{event.score}%</span>
                )}
              </>
            )}
            {event.status === 'submitted' && (
              <>
                <CheckCircle size={12} className="mr-1 text-blue-600" />
                <span className="text-blue-600">Submitted</span>
              </>
            )}
            {event.status === 'pending' && (
              <>
                <AlertCircle size={12} className="mr-1 text-orange-600" />
                <span className="text-orange-600">Pending</span>
              </>
            )}
          </div>
        )}

        {!compact && userRole === 'instructor' && event.pendingEvaluations > 0 && (
          <div className="flex items-center mt-1 text-xs text-orange-600">
            <AlertCircle size={12} className="mr-1" />
            {event.pendingEvaluations} pending evaluation{event.pendingEvaluations > 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  };

  /**
   * Render month view
   */
  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="flex-1 overflow-auto">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 border-b">
          {weekDays.map((day) => (
            <div
              key={day}
              className="bg-gray-50 p-3 text-center font-semibold text-gray-700 text-sm"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200" style={{ minHeight: '500px' }}>
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            const isCurrentDay = isToday(day.date);
            const displayedEvents = dayEvents.slice(0, 3);
            const remainingCount = dayEvents.length - displayedEvents.length;

            return (
              <div
                key={index}
                className={`bg-white p-2 min-h-[100px] ${
                  !day.isCurrentMonth ? 'bg-gray-50' : ''
                } ${
                  isCurrentDay ? 'ring-2 ring-blue-500 ring-inset' : ''
                } cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => onDateClick && onDateClick(day.date)}
              >
                <div
                  className={`text-sm font-medium mb-2 ${
                    !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                  } ${
                    isCurrentDay ? 'text-blue-600 font-bold' : ''
                  }`}
                >
                  {day.date.getDate()}
                </div>

                <div className="space-y-1">
                  {displayedEvents.map((event) => (
                    <EventCard key={event.id} event={event} compact />
                  ))}

                  {remainingCount > 0 && (
                    <div className="text-xs text-blue-600 font-semibold pl-2">
                      +{remainingCount} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Render week view
   */
  const renderWeekView = () => {
    const days = getDaysInWeek(currentDate);
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 gap-4">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            const isCurrentDay = isToday(day.date);

            return (
              <div
                key={index}
                className={`bg-white rounded-lg p-4 min-h-[400px] border-2 ${
                  isCurrentDay ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600">{weekDays[index]}</div>
                  <div
                    className={`text-2xl font-bold ${
                      isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {day.date.getDate()}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}

                  {dayEvents.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-8">
                      No events
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Render day view
   */
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const isCurrentDay = isToday(currentDate);

    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-600">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
            <div
              className={`text-4xl font-bold ${
                isCurrentDay ? 'text-blue-600' : 'text-gray-900'
              }`}
            >
              {currentDate.getDate()}
            </div>
            <div className="text-lg text-gray-600">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div className="space-y-4">
            {dayEvents.length > 0 ? (
              dayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="text-center py-12">
                <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
                <div className="text-gray-400">No events scheduled for this day</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render the appropriate view
   */
  const renderView = () => {
    switch (view) {
      case 'month':
        return renderMonthView();
      case 'week':
        return renderWeekView();
      case 'day':
        return renderDayView();
      default:
        return renderMonthView();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm">
      {renderView()}
    </div>
  );
};

export default CalendarView;
