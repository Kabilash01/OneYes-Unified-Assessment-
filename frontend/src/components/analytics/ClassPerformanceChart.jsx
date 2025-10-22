import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from './ChartContainer';

const ClassPerformanceChart = ({ data, loading = false, error = null, onRetry = null }) => {
  if (!data) return null;

  const classPerformance = data?.classPerformance || {};
  const students = classPerformance.students || [];
  const distribution = classPerformance.distribution || {};

  // Prepare student performance data
  const studentData = students.map(student => ({
    name: student.name || 'Unknown',
    score: student.score || 0,
    percentage: student.percentage || 0,
    rank: student.rank || 0
  })).sort((a, b) => b.percentage - a.percentage);

  // Prepare distribution data
  const distributionData = [
    { range: '0-20%', count: distribution['0-20'] || 0, color: '#EF4444' },
    { range: '21-40%', count: distribution['21-40'] || 0, color: '#F59E0B' },
    { range: '41-60%', count: distribution['41-60'] || 0, color: '#FBBF24' },
    { range: '61-80%', count: distribution['61-80'] || 0, color: '#10B981' },
    { range: '81-100%', count: distribution['81-100'] || 0, color: '#059669' }
  ];

  const avgPercentage = classPerformance.avgPercentage || 0;

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
                {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Student Performance Comparison */}
      <ChartContainer
        title="Student Performance Comparison"
        subtitle={`Class average: ${avgPercentage.toFixed(1)}%`}
        loading={loading}
        error={error}
        onRetry={onRetry}
      >
        {studentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={studentData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="percentage" 
                name="Percentage" 
                fill="#6366F1" 
                radius={[8, 8, 0, 0]}
              />
              {/* Average line */}
              <Line
                type="monotone"
                dataKey={() => avgPercentage}
                name="Class Average"
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <p>No student performance data available</p>
          </div>
        )}
      </ChartContainer>

      {/* Score Distribution */}
      <ChartContainer
        title="Score Distribution"
        subtitle="How scores are distributed across the class"
        loading={loading}
        error={error}
        onRetry={onRetry}
      >
        {distributionData.some(d => d.count > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="range" 
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
                label={{ value: 'Number of Students', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="count" 
                name="Students"
                radius={[8, 8, 0, 0]}
              >
                {distributionData.map((entry, index) => (
                  <Bar key={`bar-${index}`} dataKey="count" fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <p>No distribution data available</p>
          </div>
        )}
      </ChartContainer>

      {/* Top Performers */}
      {studentData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Performers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {studentData.slice(0, 3).map((student, index) => {
              const medals = ['🥇', '🥈', '🥉'];
              const colors = [
                'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
                'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600',
                'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
              ];
              
              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${colors[index]}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{medals[index]}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Rank #{student.rank}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Score:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {student.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Summary */}
      {classPerformance.passRate !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pass Rate</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {classPerformance.passRate?.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {classPerformance.passCount || 0} of {students.length} students
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Highest Score</div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {classPerformance.highestScore?.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {studentData[0]?.name || 'N/A'}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Lowest Score</div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {classPerformance.lowestScore?.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {studentData[studentData.length - 1]?.name || 'N/A'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassPerformanceChart;
