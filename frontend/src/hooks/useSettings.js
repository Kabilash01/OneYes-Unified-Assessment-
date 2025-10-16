import { useState, useEffect, useCallback } from 'react';
import settingsService from '../services/settingsService';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing user settings
 * Provides settings state and actions
 */
export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch settings
   */
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsService.getSettings();
      setSettings(data.settings);
    } catch (err) {
      setError(err.message || 'Failed to fetch settings');
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update general settings
   */
  const updateGeneralSettings = useCallback(async (generalSettings) => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsService.updateGeneralSettings(generalSettings);
      setSettings(data.settings);
      toast.success('General settings updated');
      return data.settings;
    } catch (err) {
      setError(err.message || 'Failed to update settings');
      toast.error('Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update notification settings
   */
  const updateNotificationSettings = useCallback(async (notificationSettings) => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsService.updateNotificationSettings(notificationSettings);
      setSettings(data.settings);
      toast.success('Notification settings updated');
      return data.settings;
    } catch (err) {
      setError(err.message || 'Failed to update settings');
      toast.error('Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update appearance settings
   */
  const updateAppearanceSettings = useCallback(async (appearanceSettings) => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsService.updateAppearanceSettings(appearanceSettings);
      setSettings(data.settings);
      toast.success('Appearance settings updated');
      return data.settings;
    } catch (err) {
      setError(err.message || 'Failed to update settings');
      toast.error('Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update privacy settings
   */
  const updatePrivacySettings = useCallback(async (privacySettings) => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsService.updatePrivacySettings(privacySettings);
      setSettings(data.settings);
      toast.success('Privacy settings updated');
      return data.settings;
    } catch (err) {
      setError(err.message || 'Failed to update settings');
      toast.error('Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update accessibility settings
   */
  const updateAccessibilitySettings = useCallback(async (accessibilitySettings) => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsService.updateAccessibilitySettings(accessibilitySettings);
      setSettings(data.settings);
      toast.success('Accessibility settings updated');
      return data.settings;
    } catch (err) {
      setError(err.message || 'Failed to update settings');
      toast.error('Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateGeneralSettings,
    updateNotificationSettings,
    updateAppearanceSettings,
    updatePrivacySettings,
    updateAccessibilitySettings,
    refreshSettings: fetchSettings
  };
};

export default useSettings;
