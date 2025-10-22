import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, FileText, Award } from 'lucide-react';
import ChartContainer from './ChartContainer';

const PlatformMetrics = ({ data, loading, error, onRetry }) => {
  if (!data) return null;

  const growth = data?.growth || [];
  const metrics = data?.platformMetrics || {};

  // Prepare growth chart data
  const growthData = growth.map(g => ({
    month: new Date(g.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    users: g.newUsers || 0,
    assessments: g.newAssessments || 0,
    submissions: g.totalSubmissions || 0
  }));

  // Calculate growth rates
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const currentMonth = growth[growth.length - 1] || {};
  const previousMonth = growth[growth.length - 2] || {};

  const userGrowth = calculateGrowth(currentMonth.newUsers, previousMonth.newUsers);
  const assessmentGrowth = calculateGrowth(currentMonth.newAssessments, previousMonth.newAssessments);
  const submissionGrowth = calculateGrowth(currentMonth.totalSubmissions, previousMonth.totalSubmissions);

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
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const GrowthIndicator = ({ value }) => {
    const isPositive = value >= 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span>{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Growth Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">User Growth</span>
            </div>
            <GrowthIndicator value={userGrowth} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentMonth.newUsers || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">New users this month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Assessment Growth</span>
            </div>
            <GrowthIndicator value={assessmentGrowth} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentMonth.newAssessments || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">New assessments this month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Submission Growth</span>
            </div>
            <GrowthIndicator value={submissionGrowth} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentMonth.totalSubmissions || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total submissions this month</p>
        </div>
      </div>

      {/* Growth Trend Chart */}
      <ChartContainer
        title="Platform Growth Trends"
        subtitle="Monthly growth across key metrics"
        loading={loading}
        error={error}
        onRetry={onRetry}
      >
        {growthData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={growthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAssessments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="users" 
                name="New Users"
                stroke="#6366F1" 
                fillOpacity={1}
                fill="url(#colorUsers)" 
              />
              <Area 
                type="monotone" 
                dataKey="assessments" 
                name="New Assessments"
                stroke="#10B981" 
                fillOpacity={1}
                fill="url(#colorAssessments)" 
              />
              <Area 
                type="monotone" 
                dataKey="submissions" 
                name="Total Submissions"
                stroke="#8B5CF6" 
                fillOpacity={1}
                fill="url(#colorSubmissions)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <p>No growth data available</p>
          </div>
        )}
      </ChartContainer>

      {/* Key Metrics Summary */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Platform Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm opacity-90">Total Users</p>
            <p className="text-3xl font-bold mt-1">{metrics.totalUsers || 0}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Total Assessments</p>
            <p className="text-3xl font-bold mt-1">{metrics.totalAssessments || 0}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Total Submissions</p>
            <p className="text-3xl font-bold mt-1">{metrics.totalSubmissions || 0}</p>
          </div>
          <div>
            <p className="text-sm opacity-90">Average Score</p>
            <p className="text-3xl font-bold mt-1">{metrics.avgScore?.toFixed(1) || 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformMetrics;
