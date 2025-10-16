import React, { useState } from 'react';
import { Settings, Bell, Palette, Lock, Accessibility } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useSettings } from '../../hooks/useSettings';
import GeneralSettings from '../../components/student/GeneralSettings';
import NotificationSettings from '../../components/student/NotificationSettings';
import AppearanceSettings from '../../components/student/AppearanceSettings';
import PrivacySettings from '../../components/student/PrivacySettings';
import AccessibilitySettings from '../../components/student/AccessibilitySettings';

/**
 * Settings Page
 * Manage user preferences across 5 categories
 */
const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('general');
  const {
    settings,
    loading,
    updateGeneralSettings,
    updateNotificationSettings,
    updateAppearanceSettings,
    updatePrivacySettings,
    updateAccessibilitySettings
  } = useSettings();

  // Sidebar menu items
  const menuItems = [
    {
      id: 'general',
      label: 'General',
      icon: <Settings className="w-5 h-5" />,
      description: 'Language, timezone, and preferences'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Email, browser, and in-app alerts'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <Palette className="w-5 h-5" />,
      description: 'Theme, colors, and layout'
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: <Lock className="w-5 h-5" />,
      description: 'Profile visibility and data sharing'
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      icon: <Accessibility className="w-5 h-5" />,
      description: 'Screen reader, contrast, and more'
    }
  ];

  // Render active section content
  const renderSectionContent = () => {
    if (loading && !settings) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    switch (activeSection) {
      case 'general':
        return (
          <GeneralSettings
            settings={settings}
            onUpdate={updateGeneralSettings}
            loading={loading}
          />
        );
      case 'notifications':
        return (
          <NotificationSettings
            settings={settings}
            onUpdate={updateNotificationSettings}
            loading={loading}
          />
        );
      case 'appearance':
        return (
          <AppearanceSettings
            settings={settings}
            onUpdate={updateAppearanceSettings}
            loading={loading}
          />
        );
      case 'privacy':
        return (
          <PrivacySettings
            settings={settings}
            onUpdate={updatePrivacySettings}
            loading={loading}
          />
        );
      case 'accessibility':
        return (
          <AccessibilitySettings
            settings={settings}
            onUpdate={updateAccessibilitySettings}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Settings Sidebar */}
        <div className="w-80 flex-shrink-0 border-r bg-white overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
            <p className="text-sm text-gray-600 mb-6">
              Manage your preferences and account settings
            </p>

            {/* Menu Items */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-8">
                    {item.description}
                  </p>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
