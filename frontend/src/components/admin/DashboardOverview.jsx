import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiActivity,
  FiClock,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  // Prepare data for charts
  const usersByRoleData = [
    { name: 'Students', value: stats.users.byRole.student || 0, color: '#3B82F6' },
    { name: 'Instructors', value: stats.users.byRole.instructor || 0, color: '#10B981' },
    { name: 'Admins', value: stats.users.byRole.admin || 0, color: '#F59E0B' },
  ];

  const assessmentsByStatusData = [
    { name: 'Published', value: stats.assessments.byStatus.published || 0, color: '#10B981' },
    { name: 'Draft', value: stats.assessments.byStatus.draft || 0, color: '#6B7280' },
    { name: 'Archived', value: stats.assessments.byStatus.archived || 0, color: '#EF4444' },
  ];

  // Format monthly assessments data
  const monthlyAssessmentsData = (stats.assessments.byMonth || []).map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    assessments: item.count,
  }));

  // Format daily registrations data
  const dailyRegistrationsData = (stats.registrationsByDay || []).map((item) => ({
    name: `${item._id.month}/${item._id.day}`,
    registrations: item.count,
  }));

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      icon: FiUsers,
      color: 'bg-blue-500',
      change: '+12% from last month',
    },
    {
      title: 'Total Assessments',
      value: stats.assessments.total,
      icon: FiFileText,
      color: 'bg-green-500',
      change: `${stats.assessments.published} published`,
    },
    {
      title: 'Total Submissions',
      value: stats.submissions.total,
      icon: FiCheckCircle,
      color: 'bg-purple-500',
      change: `${stats.submissions.pendingEvaluations} pending`,
    },
    {
      title: 'Active Issues',
      value: stats.recentActivity?.filter((a) => a.status === 'error').length || 0,
      icon: FiAlertTriangle,
      color: 'bg-red-500',
      change: 'Last 24 hours',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor platform activity and key metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                  <FiTrendingUp className="w-3 h-3 mr-1" />
                  {card.change}
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessments by Month */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Assessments Created (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyAssessmentsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="assessments" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Users by Role */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Users by Role
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usersByRoleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {usersByRoleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations Over Time */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Registrations (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRegistrationsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Assessments by Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Assessment Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assessmentsByStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {assessmentsByStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          <FiActivity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.slice(0, 10).map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div
                  className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                    activity.status === 'success'
                      ? 'bg-green-500'
                      : activity.status === 'error'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.userId?.name || 'Unknown User'}
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      {activity.action.replace(/_/g, ' ')}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.userId?.email || 'No email'} • {activity.userId?.role || 'N/A'}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <FiClock className="w-3 h-3 mr-1" />
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No recent activity
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
