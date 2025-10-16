import { useState, useEffect, useCallback } from 'react';
import profileService from '../services/profileService';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing user profile
 * Provides profile state and actions
 */
export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch profile data
   */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile();
      setProfile(data.profile);
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update profile
   */
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.updateProfile(profileData);
      setProfile(data.profile);
      toast.success('Profile updated successfully');
      return data.profile;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      toast.error('Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload avatar
   */
  const uploadAvatar = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.uploadAvatar(file);
      
      // Update profile with new avatar URL
      setProfile(prev => ({
        ...prev,
        profilePic: data.avatarUrl
      }));
      
      toast.success('Avatar uploaded successfully');
      return data.avatarUrl;
    } catch (err) {
      setError(err.message || 'Failed to upload avatar');
      toast.error('Failed to upload avatar');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Change password
   */
  const changePassword = useCallback(async (passwordData) => {
    setLoading(true);
    setError(null);
    try {
      await profileService.changePassword(passwordData);
      toast.success('Password changed successfully');
    } catch (err) {
      setError(err.message || 'Failed to change password');
      toast.error(err.message || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
    refreshProfile: fetchProfile
  };
};

export default useProfile;
