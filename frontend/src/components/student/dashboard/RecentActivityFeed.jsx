import React from 'react';
import { Activity, CheckCircle, Award, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * Activity Item Component
 * Individual activity in the feed
 */
const ActivityItem = ({ activity }) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'completed':
        return (
          <div className="flex-shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
        );
      case 'score_received':
        return (
          <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
        );
      case 'assigned':
        return (
          <div className="flex-shrink-0 w-2 h-2 mt-2 bg-orange-500 rounded-full"></div>
        );
      default:
        return (
          <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-500 rounded-full"></div>
        );
    }
  };

  return (
    <div className="flex gap-3 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors px-2 -mx-2 rounded">
      {/* Dot Indicator */}
      {getActivityIcon()}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {activity.title}
        </p>
        {activity.details && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {activity.details}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

/**
 * Recent Activity Feed Component
 * Displays timeline of recent activities
 * 
 * @param {Object} props
 * @param {Array} props.activities - Array of recent activities
 */
const RecentActivityFeed = ({ activities }) => {
  if (!activities) {
    // Loading skeleton
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 py-3 animate-pulse">
              <div className="w-2 h-2 mt-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 max-h-[600px] flex flex-col">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600" />
        Recent Activity
      </h3>

      {/* Activity List */}
      {activities.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
          {activities.map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              No recent activity
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Complete assessments to see updates
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;
