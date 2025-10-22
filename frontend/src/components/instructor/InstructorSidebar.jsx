import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Home,
  FileText,
  Calendar,
  CheckCircle,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  MessageSquare,
  BarChart2,
} from 'react-feather';

const InstructorSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/instructor/dashboard',
      icon: Home,
      label: 'Dashboard',
      end: true,
    },
    {
      path: '/instructor/create',
      icon: PlusCircle,
      label: 'Create Assessment',
    },
    {
      path: '/instructor/assessments',
      icon: FileText,
      label: 'Manage Assessments',
    },
    {
      path: '/instructor/calendar',
      icon: Calendar,
      label: 'Evaluation Calendar',
    },
    {
      path: '/instructor/analytics',
      icon: BarChart2,
      label: 'Analytics',
    },
    {
      path: '/instructor/support',
      icon: MessageSquare,
      label: 'Support',
    },
    {
      path: '/instructor/settings',
      icon: Settings,
      label: 'Settings',
    },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo/Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Instructor
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="ml-3 font-medium">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="w-64 h-full bg-white dark:bg-gray-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default InstructorSidebar;
