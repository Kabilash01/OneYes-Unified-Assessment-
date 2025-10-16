import React from 'react';
import StatCard from './StatCard';
import { Clipboard, Star, Clock, Calendar } from 'lucide-react';

/**
 * Stats Section Component - Matches exact design specification
 * Displays grid of 4 stat cards with specific colors
 * 
 * @param {Object} props
 * @param {Object} props.stats - Statistics object from API
 * @param {boolean} props.loading - Loading state
 */
const StatsSection = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="bg-white rounded-xl p-6 shadow-sm animate-pulse"
            style={{ borderRadius: '12px' }}
          >
            <div className="h-3 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-9 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Card 1: Total Assessments - Blue */}
      <StatCard
        title="Total Assessments Taken"
        value={stats.totalAssessments || '24'}
        trend={stats.totalAssessmentsTrend || '+3 this month'}
        icon={Clipboard}
        iconBg="#EEF2FF"
        iconColor="#5B5FEF"
      />
      
      {/* Card 2: Average Score - Yellow */}
      <StatCard
        title="Average Score"
        value={`${stats.averageScore || '78'}%`}
        trend={stats.averageScoreTrend || '+5% from last month'}
        icon={Star}
        iconBg="#FEF3C7"
        iconColor="#F59E0B"
      />
      
      {/* Card 3: Pending Evaluations - Orange */}
      <StatCard
        title="Pending Evaluations"
        value={stats.pendingEvaluations || '3'}
        trend="Waiting for results"
        icon={Clock}
        iconBg="#FFEDD5"
        iconColor="#F97316"
      />
      
      {/* Card 4: Upcoming Tests - Green */}
      <StatCard
        title="Upcoming Tests"
        value={stats.upcomingTests || '2'}
        trend="In next 7 days"
        icon={Calendar}
        iconBg="#D1FAE5"
        iconColor="#10B981"
      />
    </div>
  );
};

export default StatsSection;
