import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudentDashboard } from '../../hooks/useStudentDashboard';
import DashboardLayout from '../../components/layout/DashboardLayout';
import WelcomeSection from '../../components/student/dashboard/WelcomeSection';
import StatsSection from '../../components/student/dashboard/StatsSection';
import PerformanceTrendChart from '../../components/student/dashboard/PerformanceTrendChart';
import UpcomingAssessmentsSection from '../../components/student/dashboard/UpcomingAssessmentsSection';
import QuickActionsPanel from '../../components/student/dashboard/QuickActionsPanel';
import RecentActivityFeed from '../../components/student/dashboard/RecentActivityFeed';
import { PageLoader } from '../../components/common/Loader';

/**
 * Student Dashboard Page - Matches exact design specification
 * Main dashboard view with navigation, stats, charts, and activities
 */
const Dashboard = () => {
  const { user } = useAuth();
  const {
    stats,
    performanceTrend,
    upcomingAssessments,
    recentActivity,
    loading,
    error,
  } = useStudentDashboard();

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoader message="Loading your dashboard..." />
      </DashboardLayout>
    );
  }

  if (error && !stats) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4" style={{ color: '#EF4444' }}>⚠️</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>
              Unable to Load Dashboard
            </h2>
            <p className="mb-6" style={{ color: '#6B7280', fontSize: '14px' }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 text-white rounded-lg transition-all font-semibold"
              style={{ backgroundColor: '#5B5FEF' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Welcome Banner - Full Width */}
      <WelcomeSection user={user} />

      {/* Stats Cards - 4 columns */}
      <StatsSection stats={stats} loading={loading} />

      {/* Main Content Grid - 2:1 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Trend Chart - 2/3 width */}
        <div className="lg:col-span-2">
          <PerformanceTrendChart data={performanceTrend} loading={loading} />
        </div>

        {/* Quick Actions Panel - 1/3 width */}
        <div className="lg:col-span-1">
          <QuickActionsPanel />
        </div>
      </div>

      {/* Bottom Grid - 2:1 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Assessments - 2/3 width */}
        <div className="lg:col-span-2">
          <UpcomingAssessmentsSection assessments={upcomingAssessments} loading={loading} />
        </div>

        {/* Recent Activity Feed - 1/3 width */}
        <div className="lg:col-span-1">
          <RecentActivityFeed activities={recentActivity} loading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
