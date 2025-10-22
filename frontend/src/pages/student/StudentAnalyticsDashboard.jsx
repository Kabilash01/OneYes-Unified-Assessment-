import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudentAnalytics } from '../../hooks/useAnalytics';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, BookOpen, Target, Download, Mail, Calendar } from 'lucide-react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import DateRangePicker from '../../components/analytics/DateRangePicker';
import ExportButton from '../../components/analytics/ExportButton';

const StudentAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const { data, loading, error, refetch } = useStudentAnalytics(user?._id, dateRange);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <Button onClick={refetch} className="mt-4" variant="danger">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const performanceData = data?.performance?.overall || {};
  const trendData = data?.performance?.trend || [];
  const subjectData = data?.subjects || [];
  const strengthsData = data?.strengths || {};

  // Prepare chart data
  const trendChartData = trendData.map(t => ({
    date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: t.score,
    total: t.totalMarks,
    percentage: ((t.score / t.totalMarks) * 100).toFixed(1)
  }));

  const subjectChartData = subjectData.map(s => ({
    name: s.subject || s._id,
    avgScore: s.avgScore,
    count: s.count
  }));

  // Colors for charts
  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Analytics Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Track your performance and progress over time
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onChange={setDateRange}
              />
              <ExportButton
                reportType="student"
                userId={user?._id}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Submissions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Submissions
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {performanceData.totalSubmissions || 0}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {performanceData.avgScore?.toFixed(1) || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Average Percentage */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Percentage
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {performanceData.avgPercentage?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Highest Score */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Highest Score
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {performanceData.maxScore || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Performance Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance Trend
            </h2>
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#6366F1" 
                    strokeWidth={2}
                    name="Percentage %"
                    dot={{ fill: '#6366F1', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No performance data available
              </div>
            )}
          </div>

          {/* Subject Breakdown Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Subject Performance
            </h2>
            {subjectChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#8B5CF6" name="Average Score" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No subject data available
              </div>
            )}
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-green-600" />
              Strengths
            </h2>
            {strengthsData.strengths && strengthsData.strengths.length > 0 ? (
              <div className="space-y-3">
                {strengthsData.strengths.map((strength, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {strength.subject || strength._id}
                      </span>
                    </div>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      {strength.avgScore?.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Complete more assessments to see your strengths
              </p>
            )}
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-orange-600" />
              Areas for Improvement
            </h2>
            {strengthsData.weaknesses && strengthsData.weaknesses.length > 0 ? (
              <div className="space-y-3">
                {strengthsData.weaknesses.map((weakness, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {weakness.subject || weakness._id}
                      </span>
                    </div>
                    <span className="text-orange-600 dark:text-orange-400 font-semibold">
                      {weakness.avgScore?.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Great job! No weak areas identified
              </p>
            )}
          </div>
        </div>

        {/* Recent Submissions Table */}
        {trendData.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Submissions
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {trendData.slice(-5).reverse().map((submission, index) => {
                    const percentage = ((submission.score / submission.totalMarks) * 100).toFixed(1);
                    return (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(submission.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {submission.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {submission.score}/{submission.totalMarks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            percentage >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            percentage >= 75 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            percentage >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAnalyticsDashboard;
