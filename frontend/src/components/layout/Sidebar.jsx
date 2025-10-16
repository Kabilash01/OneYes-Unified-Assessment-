import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  BookOpen, 
  FileText, 
  Calendar, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronsDown,
  ChevronsUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSidebarCollapse } from '../../hooks/useSidebarCollapse';
import { toast } from 'react-toastify';

/**
 * Sidebar Component with Collapsible Bottom Section
 * Shows main navigation items always
 * Hides Profile, Settings, Help/Support, Logout when collapsed
 */
const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { isCollapsed, toggleCollapse } = useSidebarCollapse();

  // Main navigation items (always visible)
  const mainMenuItems = [
    { 
      name: 'Dashboard', 
      icon: LayoutGrid, 
      path: '/student/dashboard' 
    },
    { 
      name: 'Browse Assessments', 
      icon: BookOpen, 
      path: '/student/assessments' 
    },
    { 
      name: 'My Submissions', 
      icon: FileText, 
      path: '/student/submissions' 
    },
    { 
      name: 'Calendar', 
      icon: Calendar, 
      path: '/student/calendar' 
    },
  ];

  // Bottom section items (collapsible)
  const bottomMenuItems = [
    { 
      name: 'Profile', 
      icon: User, 
      path: '/student/profile' 
    },
    { 
      name: 'Settings', 
      icon: Settings, 
      path: '/student/settings' 
    },
    { 
      name: 'Help/Support', 
      icon: HelpCircle, 
      path: '/student/help' 
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-60 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4">
        {/* Main Navigation Items */}
        <ul className="space-y-2">
          {mainMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 h-11 px-4 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'font-semibold text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? { backgroundColor: '#5B5FEF', color: 'white' }
                    : {}
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="w-full h-11 px-4 flex items-center justify-between mt-4 mb-4 border border-dashed border-gray-300 rounded-lg bg-transparent cursor-pointer transition-all duration-200 hover:bg-gray-50"
          style={{
            borderColor: '#E5E7EB'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#5B5FEF';
            e.currentTarget.style.backgroundColor = '#F9FAFB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
        >
          <div className="flex items-center gap-3">
            {isCollapsed ? (
              <ChevronsUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronsDown className="w-5 h-5 text-gray-500" />
            )}
            <span className="text-sm font-medium text-gray-500">
              {isCollapsed ? 'Expand' : 'Collapse'}
            </span>
          </div>
        </button>

        {/* Collapsible Bottom Section */}
        {!isCollapsed && (
          <div className="animate-expandDown">
            {/* Divider */}
            <div className="w-full h-px bg-gray-200 my-2" />

            {/* Bottom Navigation Items */}
            <ul className="space-y-2">
              {bottomMenuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 h-11 px-4 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'font-semibold text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                    style={({ isActive }) =>
                      isActive
                        ? { backgroundColor: '#5B5FEF', color: 'white' }
                        : {}
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}

              {/* Logout Button */}
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 h-11 px-4 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>
      
      <style jsx>{`
        @keyframes expandDown {
          from {
            opacity: 0;
            transform: scaleY(0.95);
          }
          to {
            opacity: 1;
            transform: scaleY(1);
          }
        }
        
        .animate-expandDown {
          animation: expandDown 200ms ease-out;
          transform-origin: top;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;

