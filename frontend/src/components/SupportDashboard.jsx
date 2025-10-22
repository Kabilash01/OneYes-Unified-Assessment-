import React, { useEffect } from 'react';
import { useSupport } from '../hooks/useSupport';
import {
  Inbox,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  MessageSquare,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * SupportDashboard Component
 * Admin/Instructor dashboard with statistics and charts
 * 
 * Props:
 * - currentUser: Logged in user
 * - onTicketClick: Callback when ticket is clicked
 */
const SupportDashboard = ({ currentUser, onTicketClick }) => {
  const { stats, tickets, loading, actions } = useSupport({
    role: currentUser?.role || 'admin',
    autoFetch: true,
    fetchInterval: 30000 // Refresh every 30 seconds
  });

  useEffect(() => {
    actions.fetchStats();
  }, []);

  /**
   * Stat cards data
   */
  const statCards = [
    {
      title: 'Total Tickets',
      value: stats.total || 0,
      icon: Inbox,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Open Tickets',
      value: stats.open || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'In Progress',
      value: stats.inProgress || 0,
      icon: Activity,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Resolved',
      value: stats.resolved || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Closed',
      value: stats.closed || 0,
      icon: XCircle,
      color: 'bg-gray-500',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Urgent Priority',
      value: stats.byPriority?.urgent || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  /**
   * Priority distribution data for pie chart
   */
  const priorityData = [
    { name: 'Low', value: stats.byPriority?.low || 0, color: '#9CA3AF' },
    { name: 'Medium', value: stats.byPriority?.medium || 0, color: '#3B82F6' },
    { name: 'High', value: stats.byPriority?.high || 0, color: '#F59E0B' },
    { name: 'Urgent', value: stats.byPriority?.urgent || 0, color: '#EF4444' }
  ];

  /**
   * Status distribution data for bar chart
   */
  const statusData = [
    { name: 'Open', count: stats.open || 0 },
    { name: 'In Progress', count: stats.inProgress || 0 },
    { name: 'Resolved', count: stats.resolved || 0 },
    { name: 'Closed', count: stats.closed || 0 }
  ];

  /**
   * Category distribution data
   */
  const categoryData = Object.entries(stats.bySubject || {}).map(([name, value]) => ({
    name: name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: value
  }));

  /**
   * Recent tickets
   */
  const recentTickets = stats.recentTickets || tickets.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of all support tickets and performance metrics
          </p>
        </div>
        <button
          onClick={actions.refresh}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Refresh Data
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Ticket Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Priority Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Tickets by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Tickets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Tickets</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentTickets.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No recent tickets
            </div>
          ) : (
            recentTickets.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => onTicketClick?.(ticket)}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        #{ticket.ticketNumber}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ticket.priority === 'urgent'
                          ? 'bg-red-100 text-red-700'
                          : ticket.priority === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : ticket.priority === 'medium'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === 'open'
                          ? 'bg-blue-100 text-blue-700'
                          : ticket.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : ticket.status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {ticket.status.replace('-', ' ')}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {ticket.title || ticket.subject}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {ticket.message}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{ticket.messageCount || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="text-sm font-medium text-gray-600">Resolution Rate</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.total > 0
              ? ((stats.resolved / stats.total) * 100).toFixed(1)
              : 0}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-medium text-gray-600">Active Tickets</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(stats.open || 0) + (stats.inProgress || 0)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h4 className="text-sm font-medium text-gray-600">Needs Attention</h4>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(stats.byPriority?.urgent || 0) + (stats.byPriority?.high || 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
