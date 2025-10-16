import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { studentAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { formatDate, formatDuration } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Spinner } from '../../components/common/Loader';

/**
 * AssessmentCalendar Component
 * @description Calendar view of assessments with color-coded dates
 */
const AssessmentCalendar = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [assessments, setAssessments] = useState([]);
  const [selectedDateAssessments, setSelectedDateAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month'); // month, week, day

  /**
   * Fetch assessments for calendar
   */
  const fetchCalendarData = async (date = currentDate) => {
    setLoading(true);
    try {
      const response = await studentAPI.getAssessmentCalendar({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      });
      setAssessments(response.data.assessments || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  /**
   * Handle date change
   */
  const handleDateChange = (date) => {
    setCurrentDate(date);
    // Filter assessments for selected date
    const filtered = assessments.filter(assessment => {
      const startDate = new Date(assessment.startDate);
      const endDate = new Date(assessment.endDate);
      return date >= startDate && date <= endDate;
    });
    setSelectedDateAssessments(filtered);
  };

  /**
   * Handle month change
   */
  const handleActiveStartDateChange = ({ activeStartDate }) => {
    setCurrentDate(activeStartDate);
  };

  /**
   * Get tile color based on assessments
   */
  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return '';

    const dayAssessments = assessments.filter(assessment => {
      const startDate = new Date(assessment.startDate);
      const endDate = new Date(assessment.endDate);
      return date >= startDate && date <= endDate;
    });

    if (dayAssessments.length === 0) return '';

    // Determine priority color
    const hasAvailable = dayAssessments.some(a => a.status === 'available');
    const hasDeadlineSoon = dayAssessments.some(a => a.status === 'deadline-soon');
    const hasStartingSoon = dayAssessments.some(a => a.status === 'starting-soon');
    const hasExpired = dayAssessments.some(a => a.status === 'expired');
    const hasCompleted = dayAssessments.some(a => a.status === 'completed');

    if (hasDeadlineSoon) return 'calendar-deadline-soon';
    if (hasAvailable) return 'calendar-available';
    if (hasStartingSoon) return 'calendar-starting-soon';
    if (hasCompleted) return 'calendar-completed';
    if (hasExpired) return 'calendar-expired';
    return 'calendar-upcoming';
  };

  /**
   * Get tile content (show assessment count)
   */
  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const dayAssessments = assessments.filter(assessment => {
      const startDate = new Date(assessment.startDate);
      const endDate = new Date(assessment.endDate);
      return date >= startDate && date <= endDate;
    });

    if (dayAssessments.length === 0) return null;

    return (
      <div className="flex justify-center items-center">
        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary-600 rounded-full">
          {dayAssessments.length}
        </span>
      </div>
    );
  };

  /**
   * Get next assessment countdown
   */
  const getNextAssessment = () => {
    const now = new Date();
    const upcoming = assessments
      .filter(a => new Date(a.startDate) > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    return upcoming[0] || null;
  };

  const nextAssessment = getNextAssessment();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Assessment Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View upcoming assessments in calendar format
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/student/assessments')}>
            📋 List View
          </Button>
        </div>
      </div>

      {/* Next Assessment Countdown */}
      {nextAssessment && (
        <Card className="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 border-primary-200 dark:border-primary-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-1">
                Next Assessment: {nextAssessment.title}
              </h3>
              <p className="text-primary-700 dark:text-primary-300">
                Starts on {formatDate(nextAssessment.startDate, true)}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate(`/student/test/${nextAssessment._id}`)}
            >
              View Details
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                <Calendar
                  onChange={handleDateChange}
                  value={currentDate}
                  onActiveStartDateChange={handleActiveStartDateChange}
                  tileClassName={getTileClassName}
                  tileContent={getTileContent}
                  className="w-full border-none shadow-none"
                />

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Status Legend
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <LegendItem color="green" label="Available Now" />
                    <LegendItem color="yellow" label="Starting Soon" />
                    <LegendItem color="gray" label="Upcoming" />
                    <LegendItem color="orange" label="Deadline Soon" />
                    <LegendItem color="red" label="Expired" />
                    <LegendItem color="blue" label="Completed" />
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Selected Date Assessments */}
        <div>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {selectedDateAssessments.length > 0
                ? `Assessments on ${format(currentDate, 'MMM d, yyyy')}`
                : 'Select a date'}
            </h3>

            {selectedDateAssessments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p>No assessments on this date</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedDateAssessments.map((assessment) => (
                  <AssessmentMiniCard
                    key={assessment._id}
                    assessment={assessment}
                    onClick={() => navigate(`/student/test/${assessment._id}`)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

/**
 * LegendItem Component
 */
const LegendItem = ({ color, label }) => {
  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-gray-400',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-full ${colorClasses[color]}`} />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  );
};

/**
 * AssessmentMiniCard Component
 */
const AssessmentMiniCard = ({ assessment, onClick }) => {
  const statusColors = {
    available: 'success',
    'starting-soon': 'warning',
    'deadline-soon': 'warning',
    expired: 'danger',
    completed: 'primary',
    upcoming: 'secondary',
  };

  return (
    <div
      onClick={onClick}
      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
          {assessment.title}
        </h4>
        <Badge variant={statusColors[assessment.status]} size="sm">
          {assessment.status.replace('-', ' ')}
        </Badge>
      </div>
      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDuration(assessment.duration)}
        </div>
        <div className="flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {assessment.totalMarks} marks
        </div>
      </div>
    </div>
  );
};

export default AssessmentCalendar;
