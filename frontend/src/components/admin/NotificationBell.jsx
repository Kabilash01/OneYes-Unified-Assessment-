import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from './NotificationPanel';

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, fetchUnreadCount } = useNotifications();
  const bellRef = useRef(null);
  const panelRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        bellRef.current &&
        !bellRef.current.contains(event.target) &&
        panelRef.current &&
        !panelRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Refresh unread count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        ref={bellRef}
        onClick={togglePanel}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <Bell size={24} />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel Dropdown */}
      {isOpen && (
        <div ref={panelRef}>
          <NotificationPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
