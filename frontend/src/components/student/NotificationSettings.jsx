import React, { useState } from 'react';
import { Save } from 'lucide-react';
import Button from '../common/Button';

/**
 * Notification Settings Section
 * Email, browser, and in-app notification preferences
 */
const NotificationSettings = ({ settings, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    email: {
      assessmentReminders: settings?.notifications?.email?.assessmentReminders ?? true,
      resultPublished: settings?.notifications?.email?.resultPublished ?? true,
      deadlineAlerts: settings?.notifications?.email?.deadlineAlerts ?? true,
      newAssignments: settings?.notifications?.email?.newAssignments ?? true,
      systemUpdates: settings?.notifications?.email?.systemUpdates ?? false,
      weeklyDigest: settings?.notifications?.email?.weeklyDigest ?? true
    },
    browser: {
      enabled: settings?.notifications?.browser?.enabled ?? true,
      sound: settings?.notifications?.browser?.sound ?? true,
      desktop: settings?.notifications?.browser?.desktop ?? true
    },
    inApp: {
      showBadge: settings?.notifications?.inApp?.showBadge ?? true,
      autoMarkRead: settings?.notifications?.inApp?.autoMarkRead ?? false,
      position: settings?.notifications?.inApp?.position || 'top-right'
    },
    digestMode: settings?.notifications?.digestMode || 'daily',
    quietHours: {
      enabled: settings?.notifications?.quietHours?.enabled ?? false,
      start: settings?.notifications?.quietHours?.start || '22:00',
      end: settings?.notifications?.quietHours?.end || '08:00'
    }
  });

  // Handle toggle change
  const handleToggle = (category, field) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field]
      }
    }));
  };

  // Handle select change
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [category, field] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  // Toggle component
  const Toggle = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Notification Settings
        </h2>
        <p className="text-gray-600">
          Manage how and when you receive notifications
        </p>
      </div>

      {/* Email Notifications */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Email Notifications
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose which notifications you want to receive via email
        </p>

        <div className="space-y-3">
          {[
            {
              key: 'assessmentReminders',
              label: 'Assessment Reminders',
              description: 'Get notified before assessments start'
            },
            {
              key: 'resultPublished',
              label: 'Results Published',
              description: 'Receive alerts when results are available'
            },
            {
              key: 'deadlineAlerts',
              label: 'Deadline Alerts',
              description: 'Reminders for upcoming deadlines'
            },
            {
              key: 'newAssignments',
              label: 'New Assignments',
              description: 'Get notified of new assignments'
            },
            {
              key: 'systemUpdates',
              label: 'System Updates',
              description: 'Platform updates and maintenance notices'
            },
            {
              key: 'weeklyDigest',
              label: 'Weekly Digest',
              description: 'Summary of your weekly activities'
            }
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{item.label}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <Toggle
                checked={formData.email[item.key]}
                onChange={() => handleToggle('email', item.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Browser Notifications */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Browser Notifications
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure browser push notifications
        </p>

        <div className="space-y-3">
          {[
            {
              key: 'enabled',
              label: 'Enable Browser Notifications',
              description: 'Allow browser to show notifications'
            },
            {
              key: 'sound',
              label: 'Notification Sound',
              description: 'Play sound with notifications'
            },
            {
              key: 'desktop',
              label: 'Desktop Notifications',
              description: 'Show notifications on desktop'
            }
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{item.label}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <Toggle
                checked={formData.browser[item.key]}
                onChange={() => handleToggle('browser', item.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          In-App Notifications
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize in-app notification behavior
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                Show Notification Badge
              </h4>
              <p className="text-sm text-gray-600">
                Display unread count on notification bell
              </p>
            </div>
            <Toggle
              checked={formData.inApp.showBadge}
              onChange={() => handleToggle('inApp', 'showBadge')}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                Auto Mark as Read
              </h4>
              <p className="text-sm text-gray-600">
                Automatically mark notifications as read when viewed
              </p>
            </div>
            <Toggle
              checked={formData.inApp.autoMarkRead}
              onChange={() => handleToggle('inApp', 'autoMarkRead')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Position
            </label>
            <select
              name="inApp.position"
              value={formData.inApp.position}
              onChange={handleSelectChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
          </div>
        </div>
      </div>

      {/* Digest Mode */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Notification Digest
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Group notifications into periodic summaries
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Digest Frequency
          </label>
          <select
            name="digestMode"
            value={formData.digestMode}
            onChange={handleSelectChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="realtime">Real-time (No Digest)</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quiet Hours
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Pause notifications during specific times
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                Enable Quiet Hours
              </h4>
              <p className="text-sm text-gray-600">
                Mute notifications during specified hours
              </p>
            </div>
            <Toggle
              checked={formData.quietHours.enabled}
              onChange={() => handleToggle('quietHours', 'enabled')}
            />
          </div>

          {formData.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="quietHours.start"
                  value={formData.quietHours.start}
                  onChange={handleSelectChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="quietHours.end"
                  value={formData.quietHours.end}
                  onChange={handleSelectChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end">
        <Button
          type="submit"
          variant="primary"
          icon={<Save className="w-4 h-4" />}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default NotificationSettings;
