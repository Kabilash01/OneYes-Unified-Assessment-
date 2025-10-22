import React, { useState } from 'react';
import { usePlatformAnalytics } from '../../hooks/useAnalytics';
import { Users, FileText, TrendingUp, Activity, Award, Clock } from 'lucide-react';
import Loader from '../../components/common/Loader';
import DateRangePicker from '../../components/analytics/DateRangePicker';
import ExportButton from '../../components/analytics/ExportButton';
import ReportScheduler from '../../components/analytics/ReportScheduler';
import PlatformMetrics from '../../components/analytics/PlatformMetrics';
import UserEngagement from '../../components/analytics/UserEngagement';
import AssessmentDistribution from '../../components/analytics/AssessmentDistribution';
import InstructorPerformance from '../../components/analytics/InstructorPerformance';

const AdminAnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const { data, loading, error, refetch } = usePlatformAnalytics(dateRange);

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
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const platformMetrics = data?.platformMetrics || {};
  const engagement = data?.engagement || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Platform Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor platform-wide performance and user activity
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DateRangePicker
              startDate={dateRange.start}
              endDate={dateRange.end}
              onChange={setDateRange}
            />
            <ExportButton
              reportType="admin"
              filters={dateRange}
            />
            <ReportScheduler
              reportType="admin"
              filters={{}}
            />
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {platformMetrics.totalUsers || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {platformMetrics.studentCount || 0} students, {platformMetrics.instructorCount || 0} instructors
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Assessments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {platformMetrics.totalAssessments || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {platformMetrics.activeAssessments || 0} active
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {platformMetrics.totalSubmissions || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Avg {platformMetrics.avgScore?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {engagement.activeUsers || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Last 30 days
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Activity className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Platform Metrics Component */}
        <PlatformMetrics data={data} loading={loading} error={error} onRetry={refetch} />

        {/* User Engagement Component */}
        <UserEngagement data={data} loading={loading} error={error} onRetry={refetch} />

        {/* Grid with Distribution and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssessmentDistribution data={data} loading={loading} error={error} onRetry={refetch} />
          <InstructorPerformance data={data} loading={loading} error={error} onRetry={refetch} />
        </div>

        {/* System Health Indicators */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">User Satisfaction</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {((engagement.activeUsers / platformMetrics.totalUsers) * 100).toFixed(1)}%
                  </p>
                </div>
                <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {((platformMetrics.totalSubmissions / (platformMetrics.totalAssessments * platformMetrics.studentCount || 1)) * 100).toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Platform Usage</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {engagement.avgSessionDuration || 0}m
                  </p>
                </div>
                <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
