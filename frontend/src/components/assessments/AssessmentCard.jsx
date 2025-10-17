import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, FileText, User, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

/**
 * AssessmentCard Component
 * Card view for displaying assessment information
 * @param {Object} assessment - Assessment data object
 */
const AssessmentCard = ({ assessment }) => {
  /**
   * Get status badge configuration
   * @param {string} status - Assessment status
   * @returns {Object} - Badge styling and label
   */
  const getStatusBadge = (status) => {
    const badges = {
      available: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Available Now'
      },
      upcoming: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: 'Upcoming'
      },
      'in-progress': {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'In Progress'
      },
      completed: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        label: 'Completed'
      },
      expired: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'Expired'
      }
    };

    const badge = badges[status] || badges.available;

    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  /**
   * Get appropriate action button based on assessment status
   * @returns {JSX.Element} - Action button
   */
  const getActionButton = () => {
    switch (assessment.assessmentStatus) {
      case 'available':
        return (
          <Link
            to={`/student/assessments/${assessment._id}/take`}
            className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Assessment
          </Link>
        );
      case 'in-progress':
        return (
          <Link
            to={`/student/assessments/${assessment._id}/take`}
            className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue Assessment
          </Link>
        );
      case 'completed':
        return (
          <Link
            to={`/student/submissions/${assessment.submissionId}`}
            className="block w-full rounded-lg border border-green-600 bg-white px-4 py-2 text-center text-sm font-semibold text-green-600 transition-colors hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            View Results
          </Link>
        );
      case 'upcoming':
        return (
          <Link
            to={`/student/assessments/${assessment._id}`}
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            View Details
          </Link>
        );
      case 'expired':
        return (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-500"
          >
            Expired
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
            {assessment.title}
          </h3>
          {assessment.subjects?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {assessment.subjects.slice(0, 2).map((subject) => (
                <span
                  key={subject}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                >
                  {subject}
                </span>
              ))}
              {assessment.subjects.length > 2 && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                  +{assessment.subjects.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
        {getStatusBadge(assessment.assessmentStatus)}
      </div>

      {/* Description */}
      {assessment.description && (
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
          {assessment.description}
        </p>
      )}

      {/* Instructor */}
      <div className="mb-4 flex items-center gap-2">
        <User className="h-4 w-4 text-gray-400" />
        <span className="truncate text-sm text-gray-600">
          {assessment.createdBy?.name || 'Unknown Instructor'}
        </span>
      </div>

      {/* Details */}
      <div className="mb-4 flex flex-wrap gap-4 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{format(new Date(assessment.startDate), 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{assessment.duration} mins</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="h-4 w-4 text-gray-400" />
          <span>{assessment.totalMarks} marks</span>
        </div>
      </div>

      {/* Action Button */}
      {getActionButton()}
    </div>
  );
};

export default AssessmentCard;
