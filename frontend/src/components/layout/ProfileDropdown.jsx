import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * Profile Dropdown Component
 * Displays user info and navigation menu items
 * Shows Profile, Settings, Help/Support, and Logout options
 * 
 * @param {Object} props
 * @param {Function} props.onClose - Callback to close dropdown
 */
const ProfileDropdown = forwardRef(({ onClose }, ref) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Get user initials
  const getInitials = (name) => {
    if (!name) return 'TS';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  /**
   * Navigate to a route and close dropdown
   */
  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  /**
   * Handle logout action
   */
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
      onClose();
    } catch (error) {
      toast.error('Logout failed');
      console.error('Logout error:', error);
    }
  };

  return (
    <div
      ref={ref}
      className="absolute right-6 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[280px] max-w-[320px] z-50 animate-slideDown"
      style={{ 
        top: '64px',
        animation: 'slideDown 200ms ease-out'
      }}
      role="menu"
      aria-label="User menu"
    >
      {/* Header - User Info */}
      <div className="p-4 flex items-center gap-4 border-b border-gray-200">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
          style={{ backgroundColor: '#5B5FEF' }}
        >
          {getInitials(user?.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 truncate">
            {user?.name || 'Test Student'}
          </h4>
          <p className="text-sm text-gray-500 mt-1 truncate">
            {user?.email || 'test@example.com'}
          </p>
          <span
            className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: '#EEF2FF',
              color: '#5B5FEF'
            }}
          >
            Student
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-2">
        <button
          onClick={() => handleNavigate('/student/profile')}
          className="w-full h-11 px-4 flex items-center gap-3 rounded-lg cursor-pointer text-gray-700 text-sm font-medium transition-all duration-200 hover:bg-gray-50"
          role="menuitem"
          tabIndex={0}
        >
          <User className="w-5 h-5 text-gray-500" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => handleNavigate('/student/settings')}
          className="w-full h-11 px-4 flex items-center gap-3 rounded-lg cursor-pointer text-gray-700 text-sm font-medium transition-all duration-200 hover:bg-gray-50"
          role="menuitem"
          tabIndex={0}
        >
          <Settings className="w-5 h-5 text-gray-500" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => handleNavigate('/student/help')}
          className="w-full h-11 px-4 flex items-center gap-3 rounded-lg cursor-pointer text-gray-700 text-sm font-medium transition-all duration-200 hover:bg-gray-50"
          role="menuitem"
          tabIndex={0}
        >
          <HelpCircle className="w-5 h-5 text-gray-500" />
          <span>Help/Support</span>
        </button>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 my-2" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full h-11 px-4 flex items-center gap-3 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200"
          style={{ color: '#EF4444' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          role="menuitem"
          tabIndex={0}
        >
          <LogOut className="w-5 h-5" style={{ color: '#EF4444' }} />
          <span>Logout</span>
        </button>
      </nav>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 200ms ease-out;
        }
      `}</style>
    </div>
  );
});

ProfileDropdown.displayName = 'ProfileDropdown';

export default ProfileDropdown;
