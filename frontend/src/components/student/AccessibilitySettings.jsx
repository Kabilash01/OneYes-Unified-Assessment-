import React, { useState } from 'react';
import { Save, Eye, Move, MousePointer, Keyboard, Volume2, Type } from 'lucide-react';
import Button from '../common/Button';

/**
 * Accessibility Settings Section
 * Screen reader, contrast, motion, keyboard shortcuts, and more
 */
const AccessibilitySettings = ({ settings, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    highContrast: settings?.accessibility?.highContrast ?? false,
    reduceMotion: settings?.accessibility?.reduceMotion ?? false,
    largeCursor: settings?.accessibility?.largeCursor ?? false,
    focusIndicators: settings?.accessibility?.focusIndicators ?? true,
    screenReaderOptimized: settings?.accessibility?.screenReaderOptimized ?? false,
    readNotificationsAloud: settings?.accessibility?.readNotificationsAloud ?? false,
    keyboardShortcuts: settings?.accessibility?.keyboardShortcuts ?? true,
    showShortcutHints: settings?.accessibility?.showShortcutHints ?? true,
    dyslexiaFriendlyFont: settings?.accessibility?.dyslexiaFriendlyFont ?? false,
    lineHeight: settings?.accessibility?.lineHeight || 1.5,
    letterSpacing: settings?.accessibility?.letterSpacing || 0
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
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
          Accessibility Settings
        </h2>
        <p className="text-gray-600">
          Configure accessibility features for better usability
        </p>
      </div>

      {/* Visual Accessibility */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Visual Accessibility
            </h3>
            <p className="text-sm text-gray-600">
              Adjust visual elements for better visibility
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                High Contrast Mode
              </h4>
              <p className="text-sm text-gray-600">
                Increase contrast for better readability
              </p>
            </div>
            <Toggle
              checked={formData.highContrast}
              onChange={() => handleToggle('highContrast')}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                Enhanced Focus Indicators
              </h4>
              <p className="text-sm text-gray-600">
                Show prominent focus indicators for keyboard navigation
              </p>
            </div>
            <Toggle
              checked={formData.focusIndicators}
              onChange={() => handleToggle('focusIndicators')}
            />
          </div>
        </div>
      </div>

      {/* Motion & Animation */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Move className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Motion & Animation
            </h3>
            <p className="text-sm text-gray-600">
              Control animations and motion effects
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">
              Reduce Motion
            </h4>
            <p className="text-sm text-gray-600">
              Minimize animations and transitions
            </p>
          </div>
          <Toggle
            checked={formData.reduceMotion}
            onChange={() => handleToggle('reduceMotion')}
          />
        </div>
      </div>

      {/* Cursor & Pointer */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <MousePointer className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Cursor & Pointer
            </h3>
            <p className="text-sm text-gray-600">
              Adjust cursor visibility and size
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">
              Large Cursor
            </h4>
            <p className="text-sm text-gray-600">
              Use a larger, more visible cursor
            </p>
          </div>
          <Toggle
            checked={formData.largeCursor}
            onChange={() => handleToggle('largeCursor')}
          />
        </div>
      </div>

      {/* Screen Reader */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Screen Reader
            </h3>
            <p className="text-sm text-gray-600">
              Optimize for screen reader users
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                Screen Reader Optimized
              </h4>
              <p className="text-sm text-gray-600">
                Enhance interface for screen reader compatibility
              </p>
            </div>
            <Toggle
              checked={formData.screenReaderOptimized}
              onChange={() => handleToggle('screenReaderOptimized')}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                Read Notifications Aloud
              </h4>
              <p className="text-sm text-gray-600">
                Automatically read new notifications
              </p>
            </div>
            <Toggle
              checked={formData.readNotificationsAloud}
              onChange={() => handleToggle('readNotificationsAloud')}
            />
          </div>
        </div>
      </div>

      {/* Keyboard Navigation */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Keyboard className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Keyboard Navigation
            </h3>
            <p className="text-sm text-gray-600">
              Configure keyboard shortcuts and hints
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                Enable Keyboard Shortcuts
              </h4>
              <p className="text-sm text-gray-600">
                Use keyboard shortcuts for quick navigation
              </p>
            </div>
            <Toggle
              checked={formData.keyboardShortcuts}
              onChange={() => handleToggle('keyboardShortcuts')}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                Show Shortcut Hints
              </h4>
              <p className="text-sm text-gray-600">
                Display keyboard shortcut tooltips
              </p>
            </div>
            <Toggle
              checked={formData.showShortcutHints}
              onChange={() => handleToggle('showShortcutHints')}
            />
          </div>
        </div>

        {formData.keyboardShortcuts && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">
              Common Shortcuts:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
              <div>• <kbd className="px-2 py-1 bg-white rounded">Ctrl+K</kbd> Search</div>
              <div>• <kbd className="px-2 py-1 bg-white rounded">Ctrl+N</kbd> New Assessment</div>
              <div>• <kbd className="px-2 py-1 bg-white rounded">Ctrl+H</kbd> Help</div>
              <div>• <kbd className="px-2 py-1 bg-white rounded">Esc</kbd> Close Dialog</div>
            </div>
          </div>
        )}
      </div>

      {/* Reading & Typography */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
            <Type className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Reading & Typography
            </h3>
            <p className="text-sm text-gray-600">
              Adjust text formatting for better readability
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                Dyslexia-Friendly Font
              </h4>
              <p className="text-sm text-gray-600">
                Use OpenDyslexic font for easier reading
              </p>
            </div>
            <Toggle
              checked={formData.dyslexiaFriendlyFont}
              onChange={() => handleToggle('dyslexiaFriendlyFont')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Line Height: {formData.lineHeight}
            </label>
            <input
              type="range"
              name="lineHeight"
              value={formData.lineHeight}
              onChange={handleChange}
              min={1}
              max={2.5}
              step={0.1}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Compact (1.0)</span>
              <span>Spacious (2.5)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Letter Spacing: {formData.letterSpacing}px
            </label>
            <input
              type="range"
              name="letterSpacing"
              value={formData.letterSpacing}
              onChange={handleChange}
              min={0}
              max={5}
              step={0.5}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Normal (0px)</span>
              <span>Wide (5px)</span>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 border-2 border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <p
              style={{
                lineHeight: formData.lineHeight,
                letterSpacing: `${formData.letterSpacing}px`,
                fontFamily: formData.dyslexiaFriendlyFont ? 'OpenDyslexic, sans-serif' : 'inherit'
              }}
            >
              The quick brown fox jumps over the lazy dog. This is a sample text to
              preview your typography settings. Adjust the controls above to see how
              the text changes.
            </p>
          </div>
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

export default AccessibilitySettings;
