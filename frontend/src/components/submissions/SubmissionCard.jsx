import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';

const SubmissionCard = ({ submission }) => {
  const getStatusBadge = (status) => {
    const badges = {
      'in-progress': {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'In Progress'
      },
      'submitted': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: 'Pending Evaluation'
      },
      'evaluated': {
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Evaluated'
      }
    };

    const badge = badges[status] || badges.submitted;

    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const percentage = submission.assessmentId?.totalMarks > 0
    ? ((submission.score / submission.assessmentId.totalMarks) * 100).toFixed(0)
    : 0;

  return (
    <div className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {submission.assessmentId?.title || 'Untitled Assessment'}
          </h3>
        </div>
        {getStatusBadge(submission.status)}
      </div>

      {/* Score (if evaluated) */}
      {submission.status === 'evaluated' && (
        <div className="mb-4 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Your Score</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {submission.score}/{submission.assessmentId?.totalMarks}
              </p>
            </div>
            <div className={`text-right`}>
              <p className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                {percentage}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="space-y-2 border-t border-gray-100 pt-4">
        {submission.submittedAt && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Submitted: {format(new Date(submission.submittedAt), 'MMM dd, yyyy')}</span>
          </div>
        )}
        
        {submission.evaluatedAt && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Evaluated: {format(new Date(submission.evaluatedAt), 'MMM dd, yyyy')}</span>
          </div>
        )}

        {!submission.evaluatedAt && submission.status === 'submitted' && (
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <Clock className="h-4 w-4" />
            <span>Waiting for evaluation</span>
          </div>
        )}

        {submission.assessmentId?.subjects?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {submission.assessmentId.subjects.map((subject, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
              >
                {subject}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      <Link
        to={`/student/submissions/${submission._id}`}
        className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        <Eye className="h-4 w-4" />
        View Details
      </Link>
    </div>
  );
};

export default SubmissionCard;
