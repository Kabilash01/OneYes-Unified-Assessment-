import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import NotificationBell from './NotificationBell';

/**
 * Top Navigation Bar Component
 * Fixed navbar with logo, search, notifications, and profile dropdown
 */
const TopNavbar = () => {
  const { user } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Get user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    }

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileDropdownOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false);
      }
    }

    if (isProfileDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isProfileDropdownOpen]);

  return (
    <nav 
      className="fixed top-0 right-0 h-16 bg-white shadow-sm z-50 transition-all duration-300 ease-in-out"
      style={{
        left: 'var(--sidebar-margin, 0px)'
      }}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section - Logo */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-base"
            style={{ backgroundColor: '#5B5FEF' }}
          >
            UA
          </div>
          <span className="text-base font-semibold text-gray-900">
            Unified Assessment
          </span>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assessments..."
              className="w-full h-10 pl-11 pr-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ 
                '--tw-ring-color': '#5B5FEF'
              }}
              onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#5B5FEF')}
            />
          </div>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center gap-5">
          {/* Notification Bell */}
          <NotificationBell />

          {/* User Profile - Clickable Trigger */}
          <div className="relative">
            <button
              ref={triggerRef}
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100"
              aria-haspopup="true"
              aria-expanded={isProfileDropdownOpen}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: '#5B5FEF' }}
              >
                {user?.name ? getInitials(user.name) : 'JD'}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {user?.name || 'John Doe'}
              </span>
              <ChevronDown 
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  isProfileDropdownOpen ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <ProfileDropdown
                ref={dropdownRef}
                onClose={() => setIsProfileDropdownOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
