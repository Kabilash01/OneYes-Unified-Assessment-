import React, { useState } from 'react';
import { User, BarChart3, Activity, Shield } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TabNavigation from '../../components/common/TabNavigation';
import { useProfile } from '../../hooks/useProfile';
import ProfileOverviewTab from '../../components/student/ProfileOverviewTab';
import ProfileStatisticsTab from '../../components/student/ProfileStatisticsTab';
import ProfileActivityTab from '../../components/student/ProfileActivityTab';
import ProfileSecurityTab from '../../components/student/ProfileSecurityTab';

/**
 * Profile Page
 * View and edit user profile with 4 tabs
 */
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile, loading, updateProfile, uploadAvatar, changePassword } = useProfile();

  // Tab configuration
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <User className="w-4 h-4" />
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <Activity className="w-4 h-4" />
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-4 h-4" />
    }
  ];

  // Render active tab content
  const renderTabContent = () => {
    if (loading && !profile) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <ProfileOverviewTab
            profile={profile}
            onUpdate={updateProfile}
            onUploadAvatar={uploadAvatar}
            loading={loading}
          />
        );
      case 'statistics':
        return <ProfileStatisticsTab profile={profile} />;
      case 'activity':
        return <ProfileActivityTab profile={profile} />;
      case 'security':
        return (
          <ProfileSecurityTab
            profile={profile}
            onChangePassword={changePassword}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
