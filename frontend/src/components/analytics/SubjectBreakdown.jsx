import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ChartContainer from './ChartContainer';

const SubjectBreakdown = ({ 
  data = [], 
  loading = false,
  error = null,
  onRetry = null,
  showTable = true,
  chartType = 'bar'
}) => {
  const [sortBy, setSortBy] = useState('avgScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewType, setViewType] = useState(chartType);

  // Colors for pie chart
  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16'];

  // Custom tooltip for dark mode
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {data.name || data.subject || data._id}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Avg Score:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.avgScore?.toFixed(1) || 0}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Assessments:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.count || 0}
              </span>
            </div>
            {data.percentage !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">Percentage:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.percentage.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortedData = () => {
    if (!data || data.length === 0) return [];
    
    return [...data].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'subject' || sortBy === 'name') {
        aVal = (a.subject || a.name || a._id || '').toLowerCase();
        bVal = (b.subject || b.name || b._id || '').toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p>No subject data available</p>
        </div>
      );
    }

    const chartData = data.map(item => ({
      ...item,
      name: item.subject || item.name || item._id,
      value: item.avgScore
    }));

    if (viewType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    // Bar chart (default)
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="avgScore" 
            name="Average Score" 
            fill="#8B5CF6" 
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const renderTable = () => {
    if (!showTable) return null;

    const sortedData = getSortedData();

    return (
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Detailed Breakdown
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th 
                  className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort('subject')}
                >
                  <div className="flex items-center gap-2">
                    Subject
                    <SortIcon field="subject" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort('count')}
                >
                  <div className="flex items-center gap-2">
                    Assessments
                    <SortIcon field="count" />
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleSort('avgScore')}
                >
                  <div className="flex items-center gap-2">
                    Avg Score
                    <SortIcon field="avgScore" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((subject, index) => {
                const percentage = subject.percentage || ((subject.avgScore / subject.totalMarks) * 100);
                const performanceColor = 
                  percentage >= 90 ? 'text-green-600 dark:text-green-400' :
                  percentage >= 75 ? 'text-blue-600 dark:text-blue-400' :
                  percentage >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400';
                
                return (
                  <tr 
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {subject.subject || subject.name || subject._id}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {subject.count || 0}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {subject.avgScore?.toFixed(1) || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${performanceColor}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <ChartContainer
      title="Subject Performance Analysis"
      subtitle="Detailed breakdown of performance across all subjects"
      loading={loading}
      error={error}
      onRetry={onRetry}
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => setViewType('bar')}
            className={`px-3 py-1 text-sm rounded ${
              viewType === 'bar'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setViewType('pie')}
            className={`px-3 py-1 text-sm rounded ${
              viewType === 'pie'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Pie Chart
          </button>
        </div>
      }
    >
      {renderChart()}
      {renderTable()}
    </ChartContainer>
  );
};

export default SubjectBreakdown;
