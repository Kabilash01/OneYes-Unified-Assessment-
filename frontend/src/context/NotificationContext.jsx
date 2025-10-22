import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: false
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  CLEAR_ALL_READ: 'CLEAR_ALL_READ',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  SET_ERROR: 'SET_ERROR',
  SET_PAGE: 'SET_PAGE'
};

// Reducer
function notificationReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload.notifications,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        hasMore: action.payload.currentPage < action.payload.totalPages,
        loading: false
      };
    
    case ACTIONS.SET_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload };
    
    case ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif._id === action.payload ? { ...notif, isRead: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notif => ({ ...notif, isRead: true })),
        unreadCount: 0
      };
    
    case ACTIONS.DELETE_NOTIFICATION:
      const deletedNotif = state.notifications.find(n => n._id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif._id !== action.payload),
        unreadCount: deletedNotif && !deletedNotif.isRead ? state.unreadCount - 1 : state.unreadCount
      };
    
    case ACTIONS.CLEAR_ALL_READ:
      return {
        ...state,
        notifications: state.notifications.filter(notif => !notif.isRead)
      };
    
    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_PAGE:
      return { ...state, currentPage: action.payload };
    
    default:
      return state;
  }
}

// Provider component
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const initialized = useRef(false);

  // Get user role from localStorage
  const getUserRole = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return user.role;
    } catch {
      return null;
    }
  };

  // Get base URL based on user role
  const getNotificationBaseUrl = () => {
    const role = getUserRole();
    if (role === 'admin') return '/admin/notifications';
    if (role === 'instructor') return '/instructor/notifications';
    return '/student/notifications'; // default to student
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const baseUrl = getNotificationBaseUrl();
      const response = await api.get(`${baseUrl}?page=${page}&limit=20`);
      
      if (response.data.success) {
        dispatch({
          type: ACTIONS.SET_NOTIFICATIONS,
          payload: {
            notifications: response.data.data.notifications,
            currentPage: response.data.data.pagination.currentPage,
            totalPages: response.data.data.pagination.totalPages
          }
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      // Don't show toast for 403 errors (user might not have access)
      if (error.response?.status !== 403) {
        toast.error('Failed to fetch notifications');
      }
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const baseUrl = getNotificationBaseUrl();
      const response = await api.get(`${baseUrl}/unread-count`);
      
      if (response.data.success) {
        dispatch({
          type: ACTIONS.SET_UNREAD_COUNT,
          payload: response.data.data.unreadCount
        });
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const baseUrl = getNotificationBaseUrl();
      const response = await api.patch(`${baseUrl}/${notificationId}/read`);
      
      if (response.data.success) {
        dispatch({ type: ACTIONS.MARK_AS_READ, payload: notificationId });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await api.patch('/admin/notifications/mark-all-read');
      
      if (response.data.success) {
        dispatch({ type: ACTIONS.MARK_ALL_AS_READ });
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await api.delete(`/admin/notifications/${notificationId}`);
      
      if (response.data.success) {
        dispatch({ type: ACTIONS.DELETE_NOTIFICATION, payload: notificationId });
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  }, []);

  // Clear all read notifications
  const clearAllRead = useCallback(async () => {
    try {
      const response = await api.delete('/admin/notifications/clear-all');
      
      if (response.data.success) {
        dispatch({ type: ACTIONS.CLEAR_ALL_READ });
        toast.success(`${response.data.data.deletedCount} notifications cleared`);
      }
    } catch (error) {
      console.error('Error clearing read notifications:', error);
      toast.error('Failed to clear notifications');
    }
  }, []);

  // Add new notification (for real-time updates via Socket.io)
  const addNotification = useCallback((notification) => {
    dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: notification });
    
    // Show toast notification
    toast.info(notification.title, {
      position: 'top-right',
      autoClose: 5000
    });

    // Play notification sound (if enabled)
    playNotificationSound();
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      // Silently fail if audio not available
    }
  };

  // Load initial data on mount
  useEffect(() => {
    // Prevent multiple initialization
    if (initialized.current) {
      return;
    }
    initialized.current = true;

    // Only fetch notifications if user is authenticated (has token)
    const token = localStorage.getItem('token');
    if (!token) {
      return; // Don't fetch if not logged in
    }

    fetchNotifications();
    fetchUnreadCount();

    // Poll for new notifications every 5 minutes (reduced API calls)
    const interval = setInterval(() => {
      // Check token again before polling
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        fetchUnreadCount();
      }
    }, 300000); // 5 minutes = 300000ms

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const value = {
    ...state,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  
  return context;
}

export default NotificationContext;
