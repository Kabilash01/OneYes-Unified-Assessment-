import React from 'react';
import { TrendingUp, Award, Target, Clock } from 'lucide-react';

/**
 * Profile Statistics Tab
 * Display performance statistics and charts
 * Note: For full implementation, install recharts: npm install recharts
 */
const ProfileStatisticsTab = ({ profile }) => {
  // Mock statistics data (would come from API)
  const stats = {
    totalAssessments: 24,
    completedAssessments: 20,
    averageScore: 85,
    totalTimeSpent: '48h 30m',
    subjectPerformance: [
      { subject: 'Mathematics', score: 92, total: 5 },
      { subject: 'Science', score: 88, total: 4 },
      { subject: 'English', score: 85, total: 6 },
      { subject: 'History', score: 78, total: 3 },
      { subject: 'Computer Science', score: 95, total: 2 }
    ],
    recentScores: [
      { date: '2024-01', score: 78 },
      { date: '2024-02', score: 82 },
      { date: '2024-03', score: 85 },
      { date: '2024-04', score: 88 },
      { date: '2024-05', score: 90 },
      { date: '2024-06', score: 92 }
    ],
    achievements: [
      { icon: '🏆', title: 'Perfect Score', description: 'Achieved 100% in Mathematics', date: '2024-06-15' },
      { icon: '⭐', title: 'Fast Learner', description: 'Completed 10 assessments in a month', date: '2024-05-20' },
      { icon: '🎯', title: 'Consistent Performer', description: 'Maintained 80%+ average for 3 months', date: '2024-04-10' },
      { icon: '💡', title: 'Early Bird', description: 'Submitted 5 assessments before deadline', date: '2024-03-25' }
    ]
  };

  // Stats cards
  const statsCards = [
    {
      icon: <Target className="w-6 h-6" />,
      label: 'Total Assessments',
      value: stats.totalAssessments,
      color: 'blue'
    },
    {
      icon: <Award className="w-6 h-6" />,
      label: 'Average Score',
      value: `${stats.averageScore}%`,
      color: 'green'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Completed',
      value: stats.completedAssessments,
      color: 'purple'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: 'Time Spent',
      value: stats.totalTimeSpent,
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Subject Performance */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Subject Performance
        </h3>
        <div className="space-y-4">
          {stats.subjectPerformance.map((subject, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {subject.subject}
                </span>
                <span className="text-sm text-gray-600">
                  {subject.score}% • {subject.total} assessments
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${subject.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score Trend */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Score Trend (Last 6 Months)
        </h3>
        <div className="h-64 flex items-end justify-between gap-4">
          {stats.recentScores.map((item, index) => {
            const height = (item.score / 100) * 100; // Convert to percentage
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full h-48 flex items-end">
                  <div
                    className="w-full bg-blue-600 rounded-t-lg hover:bg-blue-700 transition-all cursor-pointer group relative"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded">
                      {item.score}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  {item.date.split('-')[1]}/24
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.achievements.map((achievement, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl">{achievement.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {achievement.description}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(achievement.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Chart Placeholder */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Comparison
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                My Average
              </span>
              <span className="text-sm text-gray-600">{stats.averageScore}%</span>
            </div>
            <div className="w-full h-8 bg-gray-200 rounded-lg overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-lg"
                style={{ width: `${stats.averageScore}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Class Average
              </span>
              <span className="text-sm text-gray-600">78%</span>
            </div>
            <div className="w-full h-8 bg-gray-200 rounded-lg overflow-hidden">
              <div
                className="h-full bg-gray-400 rounded-lg"
                style={{ width: '78%' }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Top Performer
              </span>
              <span className="text-sm text-gray-600">95%</span>
            </div>
            <div className="w-full h-8 bg-gray-200 rounded-lg overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-lg"
                style={{ width: '95%' }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            💪 You're performing <strong>7% above</strong> the class average!
            Keep up the great work!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileStatisticsTab;
