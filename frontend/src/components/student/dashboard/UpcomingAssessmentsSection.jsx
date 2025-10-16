import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, User, ChevronRight, BookOpen } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Assessment List Item Component
 * Individual assessment card in the list
 */
const AssessmentListItem = ({ assessment }) => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(`/student/assessments/${assessment._id}`);
  };

  const getStatusBadge = () => {
    if (assessment.status === 'available') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Available Now
        </span>
      );
    }

    // Parse the startsIn text to determine urgency
    if (assessment.startsIn.includes('hour')) {
      return (
        <span className="inline-flex items-center px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded-full">
          {assessment.startsIn}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full">
        {assessment.startsIn}
      </span>
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Left: Assessment Info */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
            {assessment.title}
          </h4>

          {/* Subject Badge */}
          {assessment.subjects && assessment.subjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {assessment.subjects.map((subject, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded"
                >
                  {subject}
                </span>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {/* Instructor */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{assessment.instructor?.name || 'Unknown'}</span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(assessment.scheduledDate), 'MMM d, h:mm a')}</span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{assessment.duration} minutes</span>
            </div>
          </div>
        </div>

        {/* Right: Status and Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:flex-shrink-0">
          {/* Status Badge */}
          {getStatusBadge()}

          {/* Action Button */}
          <button
            onClick={handleStart}
            disabled={assessment.status !== 'available'}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
              assessment.status === 'available'
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            aria-label={assessment.status === 'available' ? 'Start assessment' : 'Assessment not available yet'}
          >
            <span>Start</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Upcoming Assessments Section Component
 * Displays list of upcoming assessments
 * 
 * @param {Object} props
 * @param {Array} props.assessments - Array of upcoming assessments
 */
const UpcomingAssessmentsSection = ({ assessments }) => {
  if (!assessments) {
    // Loading skeleton
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Assessments
          </h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Upcoming Assessments
        </h3>
        <Link
          to="/student/assessments"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Assessment List */}
      {assessments.length > 0 ? (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <AssessmentListItem key={assessment._id} assessment={assessment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            No upcoming assessments
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Check back later for new assessments
          </p>
        </div>
      )}
    </div>
  );
};

export default UpcomingAssessmentsSection;
