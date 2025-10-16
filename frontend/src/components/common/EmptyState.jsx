import React from 'react';
import { BookOpen, Search, AlertCircle, Inbox } from 'lucide-react';
import Button from './Button';

/**
 * Empty State Component
 * Displays when no data is available with customizable message and action
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Data Found',
  message = 'There is no data to display at the moment.',
  actionLabel,
  onAction,
  variant = 'default',
  className = ''
}) => {
  // Predefined variants
  const variants = {
    search: {
      icon: Search,
      title: 'No Results Found',
      message: 'We couldn\'t find any results matching your search. Try adjusting your filters or search terms.'
    },
    assessments: {
      icon: BookOpen,
      title: 'No Assessments Found',
      message: 'There are no assessments available at the moment. Check back later or adjust your filters.'
    },
    notifications: {
      icon: Inbox,
      title: 'No Notifications',
      message: 'You\'re all caught up! You have no new notifications.'
    },
    error: {
      icon: AlertCircle,
      title: 'Something Went Wrong',
      message: 'We encountered an error while loading the data. Please try again later.'
    }
  };

  // Use variant config if specified
  const config = variant !== 'default' && variants[variant] ? variants[variant] : {};
  const FinalIcon = Icon || config.icon || Inbox;
  const finalTitle = title || config.title;
  const finalMessage = message || config.message;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Icon */}
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
          <FinalIcon className="w-8 h-8 text-gray-400" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {finalTitle}
      </h3>

      {/* Message */}
      <p className="text-sm text-gray-600 max-w-md mb-6">
        {finalMessage}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          className="mt-2"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

/**
 * Empty State with Image
 * Enhanced empty state with custom illustration
 */
export const EmptyStateWithImage = ({
  imageSrc,
  imageAlt = 'Empty state illustration',
  title,
  message,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Image */}
      {imageSrc && (
        <div className="mb-6">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-64 h-64 object-contain"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Message */}
      <p className="text-sm text-gray-600 max-w-md mb-6">
        {message}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="primary"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
