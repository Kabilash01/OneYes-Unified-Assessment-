import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Performance Trend Chart Component - Matches exact design specification
 * Displays 6-month performance trend with smooth curve
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of monthly performance data
 * @param {boolean} props.loading - Loading state
 */
const PerformanceTrendChart = ({ data, loading }) => {
  // Sample data if no real data provided
  const performanceData = data && data.length > 0 ? data : [
    { month: 'Jul', score: 65 },
    { month: 'Aug', score: 73 },
    { month: 'Sep', score: 70 },
    { month: 'Oct', score: 78 },
    { month: 'Nov', score: 75 },
    { month: 'Dec', score: 85 }
  ];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="rounded-lg p-3"
          style={{
            backgroundColor: '#111827',
            border: 'none',
            color: 'white'
          }}
        >
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm">Score: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div 
        className="bg-white rounded-xl p-8 shadow-sm animate-pulse"
        style={{ borderRadius: '12px' }}
      >
        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="h-[300px] bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-xl p-8 shadow-sm"
      style={{ borderRadius: '12px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 
          className="font-semibold"
          style={{ 
            fontSize: '18px',
            color: '#111827'
          }}
        >
          Performance Trend
        </h3>
        <p 
          className="font-medium"
          style={{ 
            fontSize: '14px',
            color: '#6B7280'
          }}
        >
          Last 6 months
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart 
          data={performanceData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#E5E7EB"
            vertical={false}
          />
          <XAxis 
            dataKey="month" 
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone"
            dataKey="score" 
            stroke="#5B5FEF" 
            strokeWidth={3}
            dot={{ 
              fill: '#5B5FEF', 
              r: 6,
              strokeWidth: 2,
              stroke: 'white'
            }}
            activeDot={{ 
              r: 8,
              fill: '#5B5FEF',
              strokeWidth: 2,
              stroke: 'white'
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceTrendChart;
