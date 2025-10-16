import React, { useState } from 'react';
import { Save, Sun, Moon, Monitor } from 'lucide-react';
import Button from '../common/Button';

/**
 * Appearance Settings Section
 * Theme, colors, layout, and dashboard customization
 */
const AppearanceSettings = ({ settings, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    theme: settings?.appearance?.theme || 'light',
    primaryColor: settings?.appearance?.primaryColor || '#5B5FEF',
    fontSize: settings?.appearance?.fontSize || 'medium',
    layoutDensity: settings?.appearance?.layoutDensity || 'comfortable',
    sidebarPosition: settings?.appearance?.sidebarPosition || 'left',
    sidebarDefaultState: settings?.appearance?.sidebarDefaultState || 'expanded',
    dashboardCustomization: {
      showUpcoming: settings?.appearance?.dashboardCustomization?.showUpcoming ?? true,
      showRecent: settings?.appearance?.dashboardCustomization?.showRecent ?? true,
      showStats: settings?.appearance?.dashboardCustomization?.showStats ?? true,
      showActivity: settings?.appearance?.dashboardCustomization?.showActivity ?? true,
      defaultTab: settings?.appearance?.dashboardCustomization?.defaultTab || 'overview'
    }
  });

  // Predefined color options
  const colorOptions = [
    { value: '#5B5FEF', label: 'Blue', class: 'bg-blue-600' },
    { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-600' },
    { value: '#EC4899', label: 'Pink', class: 'bg-pink-600' },
    { value: '#10B981', label: 'Green', class: 'bg-green-600' },
    { value: '#F59E0B', label: 'Orange', class: 'bg-orange-600' },
    { value: '#EF4444', label: 'Red', class: 'bg-red-600' }
  ];

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('dashboardCustomization.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        dashboardCustomization: {
          ...prev.dashboardCustomization,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle toggle
  const handleToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      dashboardCustomization: {
        ...prev.dashboardCustomization,
        [field]: !prev.dashboardCustomization[field]
      }
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
          Appearance Settings
        </h2>
        <p className="text-gray-600">
          Customize the look and feel of your interface
        </p>
      </div>

      {/* Theme */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose your preferred color scheme
        </p>

        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: <Sun className="w-5 h-5" /> },
            { value: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" /> },
            { value: 'auto', label: 'Auto', icon: <Monitor className="w-5 h-5" /> }
          ].map((theme) => (
            <button
              key={theme.value}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, theme: theme.value }))}
              className={`p-4 border-2 rounded-lg transition-all ${
                formData.theme === theme.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                {theme.icon}
                <span className="font-medium">{theme.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Color */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Primary Color
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select your preferred accent color
        </p>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, primaryColor: color.value }))}
              className={`relative p-4 border-2 rounded-lg transition-all ${
                formData.primaryColor === color.value
                  ? 'border-gray-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full ${color.class}`}></div>
                <span className="text-sm font-medium">{color.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Typography
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size
          </label>
          <select
            name="fontSize"
            value={formData.fontSize}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium (Default)</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra Large</option>
          </select>
        </div>
      </div>

      {/* Layout */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layout Density
            </label>
            <select
              name="layoutDensity"
              value={formData.layoutDensity}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable (Default)</option>
              <option value="spacious">Spacious</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Controls spacing between elements
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sidebar Position
            </label>
            <select
              name="sidebarPosition"
              value={formData.sidebarPosition}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sidebar Default State
            </label>
            <select
              name="sidebarDefaultState"
              value={formData.sidebarDefaultState}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="expanded">Expanded</option>
              <option value="collapsed">Collapsed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dashboard Customization */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dashboard Customization
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose which sections to display on your dashboard
        </p>

        <div className="space-y-3 mb-4">
          {[
            { key: 'showUpcoming', label: 'Upcoming Assessments', description: 'Show upcoming tests and deadlines' },
            { key: 'showRecent', label: 'Recent Activity', description: 'Display your recent submissions' },
            { key: 'showStats', label: 'Performance Statistics', description: 'Show charts and metrics' },
            { key: 'showActivity', label: 'Activity Feed', description: 'Recent actions and updates' }
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
                checked={formData.dashboardCustomization[item.key]}
                onChange={() => handleToggle(item.key)}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Dashboard Tab
          </label>
          <select
            name="dashboardCustomization.defaultTab"
            value={formData.dashboardCustomization.defaultTab}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="overview">Overview</option>
            <option value="assessments">Assessments</option>
            <option value="results">Results</option>
            <option value="calendar">Calendar</option>
          </select>
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

export default AppearanceSettings;
