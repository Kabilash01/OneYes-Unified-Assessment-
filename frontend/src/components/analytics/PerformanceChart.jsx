import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartContainer from './ChartContainer';

const PerformanceChart = ({ 
  data = [], 
  type = 'line', 
  title = 'Performance Trend',
  subtitle,
  dataKeys = [],
  height = 300,
  loading = false,
  error = null,
  onRetry = null,
  showLegend = true,
  colors = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981']
}) => {
  // Default data keys if not provided
  const defaultDataKeys = dataKeys.length > 0 ? dataKeys : [
    { key: 'percentage', name: 'Percentage', color: colors[0] },
    { key: 'score', name: 'Score', color: colors[1] }
  ];

  // Custom tooltip for dark mode
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

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p>No performance data available</p>
        </div>
      );
    }

    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const axisProps = {
      stroke: '#9CA3AF',
      style: { fontSize: '12px' }
    };

    if (type === 'area') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {defaultDataKeys.map((dk, index) => (
              <Area
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                name={dk.name}
                stroke={dk.color || colors[index % colors.length]}
                fill={dk.color || colors[index % colors.length]}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // Default to line chart
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {defaultDataKeys.map((dk, index) => (
            <Line
              key={dk.key}
              type="monotone"
              dataKey={dk.key}
              name={dk.name}
              stroke={dk.color || colors[index % colors.length]}
              strokeWidth={2}
              dot={{ fill: dk.color || colors[index % colors.length], r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      loading={loading}
      error={error}
      onRetry={onRetry}
    >
      {renderChart()}
    </ChartContainer>
  );
};

export default PerformanceChart;
