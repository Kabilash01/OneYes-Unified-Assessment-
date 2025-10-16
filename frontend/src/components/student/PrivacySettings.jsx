import React, { useState } from 'react';
import { Save, Eye, EyeOff, Users, BarChart2, Cookie, Target } from 'lucide-react';
import Button from '../common/Button';

/**
 * Privacy Settings Section
 * Profile visibility, data sharing, and tracking preferences
 */
const PrivacySettings = ({ settings, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    profileVisibility: settings?.privacy?.profileVisibility || 'public',
    showActivityStatus: settings?.privacy?.showActivityStatus ?? true,
    sharePerformance: settings?.privacy?.sharePerformance ?? false,
    allowAnalytics: settings?.privacy?.allowAnalytics ?? true,
    allowTracking: settings?.privacy?.allowTracking ?? false,
    allowRecommendations: settings?.privacy?.allowRecommendations ?? true
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle toggle
  const handleToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
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
          Privacy Settings
        </h2>
        <p className="text-gray-600">
          Control your privacy and data sharing preferences
        </p>
      </div>

      {/* Profile Visibility */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            {formData.profileVisibility === 'public' ? (
              <Eye className="w-5 h-5 text-blue-600" />
            ) : (
              <EyeOff className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Profile Visibility
            </h3>
            <p className="text-sm text-gray-600">
              Control who can see your profile information
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              value: 'public',
              label: 'Public',
              description: 'Anyone can view your profile and activity'
            },
            {
              value: 'connections',
              label: 'Connections Only',
              description: 'Only your instructors and classmates can view'
            },
            {
              value: 'private',
              label: 'Private',
              description: 'Only you can view your profile'
            }
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.profileVisibility === option.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="profileVisibility"
                value={option.value}
                checked={formData.profileVisibility === option.value}
                onChange={handleChange}
                className="mt-1"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {option.label}
                </h4>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Activity Status */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Activity Status
            </h3>
            <p className="text-sm text-gray-600">
              Let others know when you're active
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">
              Show Activity Status
            </h4>
            <p className="text-sm text-gray-600">
              Display online/offline status to other users
            </p>
          </div>
          <Toggle
            checked={formData.showActivityStatus}
            onChange={() => handleToggle('showActivityStatus')}
          />
        </div>
      </div>

      {/* Performance Sharing */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Data
            </h3>
            <p className="text-sm text-gray-600">
              Control sharing of your academic performance
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">
              Share Performance Data
            </h4>
            <p className="text-sm text-gray-600">
              Allow instructors to use your data for class analytics
            </p>
          </div>
          <Toggle
            checked={formData.sharePerformance}
            onChange={() => handleToggle('sharePerformance')}
          />
        </div>
      </div>

      {/* Analytics & Tracking */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Cookie className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Analytics & Tracking
            </h3>
            <p className="text-sm text-gray-600">
              Help us improve the platform with anonymous data
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                Allow Analytics
              </h4>
              <p className="text-sm text-gray-600">
                Share anonymous usage data to improve the platform
              </p>
            </div>
            <Toggle
              checked={formData.allowAnalytics}
              onChange={() => handleToggle('allowAnalytics')}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                Allow Tracking Cookies
              </h4>
              <p className="text-sm text-gray-600">
                Enable cookies for personalized experience
              </p>
            </div>
            <Toggle
              checked={formData.allowTracking}
              onChange={() => handleToggle('allowTracking')}
            />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Personalization
            </h3>
            <p className="text-sm text-gray-600">
              Get personalized content and recommendations
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">
              Allow Recommendations
            </h4>
            <p className="text-sm text-gray-600">
              Receive personalized assessment and content suggestions
            </p>
          </div>
          <Toggle
            checked={formData.allowRecommendations}
            onChange={() => handleToggle('allowRecommendations')}
          />
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Data Management
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Manage your personal data and account
        </p>

        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-center">
            Download My Data
          </Button>
          <Button variant="outline" className="w-full justify-center text-red-600 hover:bg-red-50">
            Delete My Account
          </Button>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Deleting your account is permanent and cannot be undone. All your data will be removed.
          </p>
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

export default PrivacySettings;
