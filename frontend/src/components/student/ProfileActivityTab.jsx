import React, { useState } from 'react';
import { FileText, CheckCircle, Clock, Calendar, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';

/**
 * Profile Activity Tab
 * Display user activity timeline and history
 */
const ProfileActivityTab = ({ profile }) => {
  const [filterType, setFilterType] = useState('all'); // all, assessments, submissions, logins

  // Mock activity data (would come from API)
  const activities = [
    {
      id: '1',
      type: 'assessment_started',
      title: 'Started Mathematics Assessment',
      description: 'Midterm Exam - Chapter 5',
      timestamp: '2024-06-15T10:30:00',
      icon: <FileText className="w-4 h-4" />,
      color: 'blue'
    },
    {
      id: '2',
      type: 'assessment_completed',
      title: 'Completed Science Quiz',
      description: 'Physics - Motion and Energy',
      score: 92,
      timestamp: '2024-06-14T15:45:00',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'green'
    },
    {
      id: '3',
      type: 'submission',
      title: 'Submitted Essay Assignment',
      description: 'English Literature - Character Analysis',
      timestamp: '2024-06-13T09:20:00',
      icon: <FileText className="w-4 h-4" />,
      color: 'purple'
    },
    {
      id: '4',
      type: 'assessment_completed',
      title: 'Completed History Test',
      description: 'World War II Timeline',
      score: 88,
      timestamp: '2024-06-12T14:00:00',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'green'
    },
    {
      id: '5',
      type: 'login',
      title: 'Logged in',
      description: 'Chrome on Windows',
      timestamp: '2024-06-11T08:15:00',
      icon: <Clock className="w-4 h-4" />,
      color: 'gray'
    },
    {
      id: '6',
      type: 'assessment_started',
      title: 'Started Computer Science Lab',
      description: 'Data Structures - Binary Trees',
      timestamp: '2024-06-10T11:00:00',
      icon: <FileText className="w-4 h-4" />,
      color: 'blue'
    },
    {
      id: '7',
      type: 'assessment_completed',
      title: 'Completed Chemistry Quiz',
      description: 'Organic Chemistry - Reactions',
      score: 95,
      timestamp: '2024-06-09T16:30:00',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'green'
    },
    {
      id: '8',
      type: 'submission',
      title: 'Submitted Lab Report',
      description: 'Biology - Cell Division Experiment',
      timestamp: '2024-06-08T13:45:00',
      icon: <FileText className="w-4 h-4" />,
      color: 'purple'
    }
  ];

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    if (filterType === 'all') return true;
    if (filterType === 'assessments') {
      return activity.type === 'assessment_started' || activity.type === 'assessment_completed';
    }
    if (filterType === 'submissions') {
      return activity.type === 'submission';
    }
    if (filterType === 'logins') {
      return activity.type === 'login';
    }
    return true;
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = format(new Date(activity.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      gray: 'bg-gray-100 text-gray-600'
    };
    return colors[color] || colors.gray;
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  // Export activity
  const handleExport = () => {
    // Mock export functionality
    const dataStr = JSON.stringify(activities, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex items-center gap-2">
              {[
                { value: 'all', label: 'All Activity' },
                { value: 'assessments', label: 'Assessments' },
                { value: 'submissions', label: 'Submissions' },
                { value: 'logins', label: 'Logins' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === filter.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Activity Timeline */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-12 h-12" />}
          title="No activity found"
          message="No activities match the selected filter"
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dayActivities]) => (
            <div key={date} className="bg-white rounded-xl border p-6">
              {/* Date Header */}
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                {formatDateHeader(date)}
              </h3>

              {/* Activities */}
              <div className="space-y-4">
                {dayActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getColorClasses(
                        activity.color
                      )}`}
                    >
                      {activity.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {activity.title}
                        </h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {format(new Date(activity.timestamp), 'h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.description}
                      </p>
                      {activity.score !== undefined && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          Score: {activity.score}%
                        </div>
                      )}
                    </div>

                    {/* Timeline line */}
                    {index < dayActivities.length - 1 && (
                      <div className="absolute left-[49px] top-14 w-0.5 h-[calc(100%-56px)] bg-gray-200"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Summary */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Activity Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {activities.filter(a => a.type.includes('assessment')).length}
            </div>
            <div className="text-sm text-gray-600">Total Assessments</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {activities.filter(a => a.type === 'assessment_completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {activities.filter(a => a.type === 'submission').length}
            </div>
            <div className="text-sm text-gray-600">Submissions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileActivityTab;
