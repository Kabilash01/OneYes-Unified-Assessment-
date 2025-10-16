import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Calendar,
  CalendarCheck, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  X,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Simple Responsive Sidebar Component
 * Desktop: Always visible, fixed position (240px wide)
 * Mobile: Slides in/out from left with hamburger toggle (280px wide)
 */
const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Open by default on desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-open on desktop, auto-close on mobile
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
      console.log('📱 Resize detected - isMobile:', mobile, 'width:', window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      console.log('🔒 Body scroll LOCKED - sidebar open');
    } else {
      document.body.style.overflow = 'auto';
      console.log('🔓 Body scroll UNLOCKED - sidebar closed');
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, isSidebarOpen]);

  // Add/remove class on body for sidebar state (for main content adjustment)
  useEffect(() => {
    if (isSidebarOpen && !isMobile) {
      document.body.classList.add('sidebar-open');
      document.body.classList.remove('sidebar-closed');
    } else {
      document.body.classList.add('sidebar-closed');
      document.body.classList.remove('sidebar-open');
    }
    console.log('🎨 Body class updated - sidebar:', isSidebarOpen ? 'open' : 'closed');
    return () => {
      document.body.classList.remove('sidebar-open', 'sidebar-closed');
    };
  }, [isSidebarOpen, isMobile]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { icon: BookOpen, label: 'Browse Assessments', path: '/student/assessments' },
    { icon: CalendarCheck, label: 'Upcoming Tests', path: '/student/upcoming-tests' },
    { icon: FileText, label: 'My Submissions', path: '/student/submissions' },
    { icon: Calendar, label: 'Calendar', path: '/student/calendar' },
    { icon: User, label: 'Profile', path: '/student/profile' },
    { icon: Settings, label: 'Settings', path: '/student/settings' },
    { icon: HelpCircle, label: 'Help & Support', path: '/student/help' },
  ];

  const handleLinkClick = () => {
    console.log('🔗 Link clicked! isMobile:', isMobile, 'isSidebarOpen:', isSidebarOpen);
    if (isMobile) {
      setIsSidebarOpen(false);
      console.log('✅ Sidebar should close now');
    }
  };

  const handleLogout = () => {
    console.log('🚪 Logout clicked!');
    logout();
    if (isMobile) setIsSidebarOpen(false);
  };


  return (
    <>
      {/* Hamburger Button - Always Visible */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-20 left-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Overlay - Mobile Only */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-60 bg-white border-r border-gray-200 
          flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">UA</span>
            </div>
            <span className="text-gray-900 font-semibold">Unified Assessment</span>
          </div>
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 font-semibold' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="px-3 py-4 border-t border-gray-200 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

