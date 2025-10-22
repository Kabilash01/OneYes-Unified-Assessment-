import { useState, useEffect } from 'react';
import { Bell, User, FileText, AlertTriangle, Settings, Megaphone, Trash2, CheckCheck, Loader } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

function NotificationsPage() {
  const {
    notifications,
    loading,
    currentPage,
    totalPages,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead
  } = useNotifications();

  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all'
  });

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'user_registered':
        return <User className="w-6 h-6 text-blue-500" />;
      case 'assessment_created':
        return <FileText className="w-6 h-6 text-green-500" />;
      case 'suspicious_activity':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'system_alert':
        return <Settings className="w-6 h-6 text-orange-500" />;
      case 'announcement':
        return <Megaphone className="w-6 h-6 text-purple-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority] || colors.medium}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  const handlePageChange = (page) => {
    fetchNotifications(page);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filters.type !== 'all' && notif.type !== filters.type) return false;
    if (filters.status === 'unread' && notif.isRead) return false;
    if (filters.status === 'read' && !notif.isRead) return false;
    if (filters.priority !== 'all' && notif.priority !== filters.priority) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          All Notifications
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and view all your notifications
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={markAllAsRead}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <CheckCheck className="w-4 h-4 mr-2" />
          Mark All as Read
        </button>
        <button
          onClick={clearAllRead}
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Read Notifications
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="user_registered">User Registered</option>
            <option value="assessment_created">Assessment Created</option>
            <option value="suspicious_activity">Suspicious Activity</option>
            <option value="system_alert">System Alerts</option>
            <option value="announcement">Announcements</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No notifications found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`
                bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 
                p-4 hover:shadow-md transition-shadow cursor-pointer
                ${!notification.isRead ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''}
              `}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`text-lg ${!notification.isRead ? 'font-bold' : 'font-semibold'} text-gray-800 dark:text-white`}>
                      {notification.title}
                    </h3>
                    {getPriorityBadge(notification.priority)}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
                    <span>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                    <span className="text-xs">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
