import React from 'react';

/**
 * Stat Card Component - Matches exact design specification
 * Displays a single statistic with icon, value, and trend
 * 
 * @param {Object} props
 * @param {string} props.title - Title of the stat (label text)
 * @param {string|number} props.value - Main value to display
 * @param {string} props.trend - Trend text (e.g., "+2 this month")
 * @param {React.Component} props.icon - Lucide icon component
 * @param {string} props.iconBg - Background color for icon circle
 * @param {string} props.iconColor - Color for the icon
 */
const StatCard = ({ title, value, trend, icon: Icon, iconBg, iconColor }) => {
  return (
    <div 
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
      style={{ borderRadius: '12px' }}
    >
      {/* Top Row - Label and Icon */}
      <div className="flex items-start justify-between mb-4">
        <p 
          className="font-medium"
          style={{ 
            fontSize: '12px',
            color: '#6B7280'
          }}
        >
          {title}
        </p>
        <div 
          className="rounded-full flex items-center justify-center"
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: iconBg
          }}
        >
          <Icon 
            className="w-6 h-6"
            style={{ color: iconColor }}
            aria-hidden="true" 
          />
        </div>
      </div>

      {/* Main Value */}
      <p 
        className="font-bold mb-2"
        style={{ 
          fontSize: '36px',
          color: '#111827'
        }}
      >
        {value}
      </p>

      {/* Trend Text */}
      {trend && (
        <p 
          className="font-normal"
          style={{ 
            fontSize: '12px',
            color: '#6B7280'
          }}
        >
          {trend}
        </p>
      )}
    </div>
  );
};

export default StatCard;
