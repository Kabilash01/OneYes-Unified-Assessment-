import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Calendar, Award, ChevronRight } from 'lucide-react';

/**
 * Quick Actions Panel Component
 * Displays quick action buttons for common tasks
 */
const QuickActionsPanel = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 1,
      title: 'Start Practice Test',
      description: 'Browse available tests',
      icon: PlayCircle,
      path: '/student/assessments',
      color: 'blue',
    },
    {
      id: 2,
      title: 'View Calendar',
      description: 'See upcoming schedule',
      icon: Calendar,
      path: '/student/assessments/calendar',
      color: 'green',
    },
    {
      id: 3,
      title: 'View Achievements',
      description: 'Track your progress',
      icon: Award,
      path: '/student/submissions',
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const colorClass = colorClasses[action.color];
          
          return (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className="w-full flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
              aria-label={action.title}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 p-2 rounded-lg ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Content */}
              <div className="flex-1 text-left">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
              
              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsPanel;
