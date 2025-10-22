import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Users, Calendar } from 'lucide-react';
import ChartContainer from './ChartContainer';

const UserEngagement = ({ data, loading, error, onRetry }) => {
  if (!data) return null;

  const engagement = data?.engagement || {};
  const retention = data?.retention || [];

  // Prepare active users data
  const activeUsersData = engagement.activeUsersByDay || [];
  const dailyActiveData = activeUsersData.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    students: day.students || 0,
    instructors: day.instructors || 0,
    total: (day.students || 0) + (day.instructors || 0)
  }));

  // Prepare retention data
  const retentionData = retention.map(r => ({
    month: new Date(r.month).toLocaleDateString('en-US', { month: 'short' }),
    rate: r.retentionRate || 0,
    activeUsers: r.activeUsers || 0,
    newUsers: r.newUsers || 0
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {typeof entry.value === 'number' ? entry.value.toFixed(0) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const avgRetentionRate = retentionData.length > 0
    ? retentionData.reduce((sum, r) => sum + r.rate, 0) / retentionData.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Engagement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Activity className="w-4 h-4" />
            <span>Active Users</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {engagement.activeUsers || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Last 30 days
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span>Avg Session</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {engagement.avgSessionDuration || 0}m
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Per user
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Users className="w-4 h-4" />
            <span>Daily Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {engagement.dailyActiveUsers || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Today
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span>Retention Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {avgRetentionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Monthly average
          </div>
        </div>
      </div>

      {/* Daily Active Users Chart */}
      <ChartContainer
        title="Daily Active Users"
        subtitle="Student and instructor activity over time"
        loading={loading}
        error={error}
        onRetry={onRetry}
      >
        {dailyActiveData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyActiveData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="students" 
                name="Students"
                stroke="#6366F1" 
                strokeWidth={2}
                dot={{ fill: '#6366F1', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="instructors" 
                name="Instructors"
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                name="Total"
                stroke="#8B5CF6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <p>No activity data available</p>
          </div>
        )}
      </ChartContainer>

      {/* Monthly Retention Chart */}
      <ChartContainer
        title="Monthly Retention Rate"
        subtitle="User retention and growth trends"
        loading={loading}
        error={error}
        onRetry={onRetry}
      >
        {retentionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={retentionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
                label={{ value: 'Retention Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="rate" 
                name="Retention Rate (%)"
                fill="#6366F1" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <p>No retention data available</p>
          </div>
        )}
      </ChartContainer>

      {/* Engagement Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Engagement Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-medium text-gray-900 dark:text-white">Peak Activity</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Most users are active between 9 AM - 5 PM on weekdays. Consider scheduling assessments during these peak hours for maximum engagement.
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h4 className="font-medium text-gray-900 dark:text-white">User Growth</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {avgRetentionRate >= 70 
                ? 'Excellent retention rate! Your platform is keeping users engaged.'
                : avgRetentionRate >= 50
                ? 'Good retention rate. Consider adding more features to improve engagement.'
                : 'Focus on user retention strategies to reduce churn.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEngagement;
