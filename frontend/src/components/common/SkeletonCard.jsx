import React from 'react';

/**
 * Skeleton Card Component
 * Loading skeleton for cards with shimmer effect
 */
const SkeletonCard = ({ variant = 'default', className = '' }) => {
  const shimmerClass = 'animate-pulse bg-gray-200';

  if (variant === 'assessment') {
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className={`h-5 ${shimmerClass} rounded w-3/4 mb-2`} />
            <div className={`h-4 ${shimmerClass} rounded w-1/2`} />
          </div>
          <div className={`h-6 w-20 ${shimmerClass} rounded-full`} />
        </div>

        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className={`h-4 ${shimmerClass} rounded w-full`} />
          <div className={`h-4 ${shimmerClass} rounded w-5/6`} />
        </div>

        {/* Instructor */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`h-8 w-8 ${shimmerClass} rounded-full`} />
          <div className={`h-4 ${shimmerClass} rounded w-32`} />
        </div>

        {/* Details */}
        <div className="flex items-center space-x-4 mb-4">
          <div className={`h-4 ${shimmerClass} rounded w-24`} />
          <div className={`h-4 ${shimmerClass} rounded w-20`} />
          <div className={`h-4 ${shimmerClass} rounded w-20`} />
        </div>

        {/* Button */}
        <div className={`h-10 ${shimmerClass} rounded-lg w-full`} />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`bg-white rounded-lg p-4 border border-gray-200 flex items-center space-x-4 ${className}`}>
        <div className={`h-12 w-12 ${shimmerClass} rounded-full flex-shrink-0`} />
        <div className="flex-1 space-y-2">
          <div className={`h-4 ${shimmerClass} rounded w-3/4`} />
          <div className={`h-3 ${shimmerClass} rounded w-1/2`} />
        </div>
        <div className={`h-8 w-24 ${shimmerClass} rounded`} />
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`}>
      <div className={`h-6 ${shimmerClass} rounded w-3/4 mb-4`} />
      <div className="space-y-2 mb-4">
        <div className={`h-4 ${shimmerClass} rounded w-full`} />
        <div className={`h-4 ${shimmerClass} rounded w-5/6`} />
        <div className={`h-4 ${shimmerClass} rounded w-4/5`} />
      </div>
      <div className={`h-10 ${shimmerClass} rounded-lg w-full`} />
    </div>
  );
};

/**
 * Skeleton Grid Component
 * Multiple skeleton cards in a grid
 */
export const SkeletonGrid = ({ count = 6, variant = 'default', className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant={variant} />
      ))}
    </div>
  );
};

/**
 * Skeleton List Component
 * Multiple skeleton items in a list
 */
export const SkeletonList = ({ count = 5, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant="list" />
      ))}
    </div>
  );
};

export default SkeletonCard;
