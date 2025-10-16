import React from 'react';
import { Calendar, Clock, FileText, User, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import Badge from './Badge';
import Button from './Button';

/**
 * Assessment Card Component (Grid View)
 * Displays assessment information in card format
 */
const AssessmentCard = ({ 
  assessment, 
  onStart, 
  onView, 
  variant = 'grid',
  className = '' 
}) => {
  const {
    _id,
    title,
    description,
    subjects,
    instructor,
    scheduledFor,
    duration,
    totalMarks,
    status,
    type,
    questionsCount
  } = assessment;

  // Calculate status badge
  const getStatusBadge = () => {
    const now = new Date();
    const scheduled = new Date(scheduledFor);
    const isCompleted = status === 'completed';
    const isUpcoming = scheduled > now;
    const isAvailable = scheduled <= now && !isCompleted;

    if (isCompleted) {
      return { text: 'Completed', color: 'gray' };
    } else if (isAvailable) {
      return { text: 'Available Now', color: 'green' };
    } else if (isUpcoming) {
      const daysUntil = Math.ceil((scheduled - now) / (1000 * 60 * 60 * 24));
      return { text: `Starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`, color: 'yellow' };
    }
    return { text: 'Upcoming', color: 'blue' };
  };

  const statusBadge = getStatusBadge();

  // Get button config
  const getButtonConfig = () => {
    if (status === 'completed') {
      return { label: 'View Results', variant: 'outline', action: onView };
    } else if (new Date(scheduledFor) <= new Date()) {
      return { label: 'Start Assessment', variant: 'primary', action: onStart };
    } else {
      return { label: 'View Details', variant: 'outline', action: onView };
    }
  };

  const buttonConfig = getButtonConfig();

  if (variant === 'list') {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all ${className}`}>
        <div className="flex items-center gap-4">
          {/* Instructor Avatar */}
          <div className="flex-shrink-0">
            {instructor?.profilePic ? (
              <img
                src={instructor.profilePic}
                alt={instructor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {instructor?.name || 'Unknown Instructor'}
                </p>
              </div>
              <Badge color={statusBadge.color}>
                {statusBadge.text}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
              {subjects?.length > 0 && (
                <Badge color="blue" variant="light">
                  {subjects[0]}
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(scheduledFor), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{duration} min</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{totalMarks} marks</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={() => buttonConfig.action(_id)}
              variant={buttonConfig.variant}
              size="sm"
            >
              {buttonConfig.label}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {title}
          </h3>
        </div>
        <Badge color={statusBadge.color} className="ml-2 flex-shrink-0">
          {statusBadge.text}
        </Badge>
      </div>

      {/* Subject Badge */}
      {subjects?.length > 0 && (
        <div className="mb-3">
          <Badge color="blue" variant="light">
            {subjects[0]}
          </Badge>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {description}
        </p>
      )}

      {/* Instructor Info */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        {instructor?.profilePic ? (
          <img
            src={instructor.profilePic}
            alt={instructor.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {instructor?.name || 'Unknown Instructor'}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <GraduationCap className="w-3 h-3" />
            <span>Instructor</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{format(new Date(scheduledFor), 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{duration} min</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span>{totalMarks} marks</span>
        </div>
        {questionsCount && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span>{questionsCount} questions</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Button
        onClick={() => buttonConfig.action(_id)}
        variant={buttonConfig.variant}
        className="w-full"
      >
        {buttonConfig.label}
      </Button>
    </div>
  );
};

export default AssessmentCard;
