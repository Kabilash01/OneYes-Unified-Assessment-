import React, { useState, useEffect } from 'react';
import { Clock, FileText, CheckCircle, XCircle, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { profileService } from '../../services/profileService';

const ActivityLog = ({ studentId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [page]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await profileService.getActivityLog(page, 20);
      setActivities(prev => page === 1 ? data.activities : [...prev, ...data.activities]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to load activities:', error);
      toast.error('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'assessment_started':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'assessment_submitted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'assessment_evaluated':
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      case 'profile_updated':
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
      case 'password_changed':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'assessment_started':
        return 'bg-blue-100';
      case 'assessment_submitted':
        return 'bg-green-100';
      case 'assessment_evaluated':
        return 'bg-purple-100';
      case 'profile_updated':
        return 'bg-gray-100';
      case 'password_changed':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatActivityMessage = (activity) => {
    const meta = activity.metadata || {};
    
    switch (activity.type) {
      case 'assessment_started':
        return `Started "${meta.assessmentTitle || 'an assessment'}"`;
      case 'assessment_submitted':
        return `Submitted "${meta.assessmentTitle || 'an assessment'}"`;
      case 'assessment_evaluated':
        return `Received evaluation for "${meta.assessmentTitle || 'an assessment'}" - Score: ${meta.score}/${meta.totalMarks}`;
      case 'profile_updated':
        return 'Updated profile information';
      case 'password_changed':
        return 'Changed account password';
      default:
        return activity.description || 'Activity recorded';
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">No activity yet</p>
        <p className="text-sm text-gray-500">Your recent activities will appear here</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {activities.map((activity, index) => (
          <div
            key={activity._id || index}
            className="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 rounded-full p-2 ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {formatActivityMessage(activity)}
                </p>
                <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(activity.createdAt), 'MMM dd, yyyy • h:mm a')}
                  </span>
                  {activity.ipAddress && (
                    <span>IP: {activity.ipAddress}</span>
                  )}
                  {activity.userAgent && (
                    <span className="hidden sm:inline truncate max-w-xs" title={activity.userAgent}>
                      {activity.userAgent.split(' ')[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
