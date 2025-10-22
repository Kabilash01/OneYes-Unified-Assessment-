import { useNavigate } from 'react-router-dom';
import { X, Bell, User, FileText, AlertTriangle, Settings, Megaphone, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

function NotificationPanel({ onClose }) {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead
  } = useNotifications();

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'user_registered':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'assessment_created':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'suspicious_activity':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'system_alert':
        return <Settings className="w-5 h-5 text-orange-500" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-4 border-red-600';
      case 'high':
        return 'border-l-4 border-orange-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Navigate to related page (optional)
    if (notification.link) {
      navigate(notification.link);
      onClose();
    } else if (notification.relatedModel === 'User') {
      navigate('/admin-dashboard/users');
      onClose();
    } else if (notification.relatedModel === 'Assessment') {
      navigate('/admin-dashboard/assessments');
      onClose();
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const truncateMessage = (message, maxLength = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Notifications
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Mark all as read
          </button>
          <button
            onClick={clearAllRead}
            className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No notifications</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`
                px-4 py-3 border-b border-gray-200 dark:border-gray-700 
                hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors
                ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                ${getPriorityColor(notification.priority)}
              `}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-800 dark:text-white`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {truncateMessage(notification.message)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteNotification(e, notification._id)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-center">
          <button
            onClick={() => {
              navigate('/admin-dashboard/notifications');
              onClose();
            }}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;
