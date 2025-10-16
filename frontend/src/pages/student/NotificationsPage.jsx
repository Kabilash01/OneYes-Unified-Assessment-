import React, { useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Award, Info, Trash2, Check, X } from 'lucide-react';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TabNavigation from '../../components/common/TabNavigation';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

/**
 * Notifications Page
 * Full page view of all notifications with filters and date grouping
 */
const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Filter tabs
  const tabs = [
    {
      id: 'all',
      label: 'All',
      count: notifications.length
    },
    {
      id: 'unread',
      label: 'Unread',
      count: notifications.filter(n => !n.isRead).length
    },
    {
      id: 'read',
      label: 'Read',
      count: notifications.filter(n => n.isRead).length
    }
  ];

  // Type filter options
  const typeFilters = [
    { value: 'all', label: 'All Types' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'result', label: 'Results' },
    { value: 'reminder', label: 'Reminders' },
    { value: 'achievement', label: 'Achievements' },
    { value: 'system', label: 'System' }
  ];

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filter by read status
    if (activeTab === 'unread' && notification.isRead) return false;
    if (activeTab === 'read' && !notification.isRead) return false;

    // Filter by type
    if (selectedType !== 'all' && notification.type !== selectedType) return false;

    return true;
  });

  // Group notifications by date
  const groupedNotifications = {
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: []
  };

  filteredNotifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    if (isToday(date)) {
      groupedNotifications.today.push(notification);
    } else if (isYesterday(date)) {
      groupedNotifications.yesterday.push(notification);
    } else if (isThisWeek(date)) {
      groupedNotifications.thisWeek.push(notification);
    } else {
      groupedNotifications.earlier.push(notification);
    }
  });

  // Get icon and color for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <FileText className="w-5 h-5" />;
      case 'result':
        return <CheckCircle className="w-5 h-5" />;
      case 'reminder':
        return <AlertCircle className="w-5 h-5" />;
      case 'achievement':
        return <Award className="w-5 h-5" />;
      case 'system':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getIconBgColor = (type) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-100 text-blue-600';
      case 'result':
        return 'bg-green-100 text-green-600';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-600';
      case 'achievement':
        return 'bg-purple-100 text-purple-600';
      case 'system':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Render notification group
  const renderNotificationGroup = (title, notifications) => {
    if (notifications.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {title}
        </h3>
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white border rounded-xl p-4 transition-all cursor-pointer ${
                !notification.isRead
                  ? 'border-l-4 border-l-blue-500 bg-blue-50 hover:bg-blue-100'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconBgColor(
                    notification.type
                  )}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Notifications
          </h1>
          <p className="text-gray-600">
            Stay updated with your assessments and activities
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tab Navigation */}
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* Type Filter */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Type:
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {typeFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>

              {/* Mark All as Read */}
              {notifications.filter(n => !n.isRead).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  icon={<Check className="w-4 h-4" />}
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            variant="notifications"
            title="No notifications"
            message={
              activeTab === 'unread'
                ? "You're all caught up! No unread notifications."
                : activeTab === 'read'
                ? "No read notifications yet."
                : "You don't have any notifications yet."
            }
          />
        ) : (
          <div>
            {renderNotificationGroup('Today', groupedNotifications.today)}
            {renderNotificationGroup('Yesterday', groupedNotifications.yesterday)}
            {renderNotificationGroup('This Week', groupedNotifications.thisWeek)}
            {renderNotificationGroup('Earlier', groupedNotifications.earlier)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
