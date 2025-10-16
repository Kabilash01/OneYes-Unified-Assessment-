import React, { useState } from 'react';
import { Lock, Shield, Smartphone, Monitor, Chrome, X, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../common/Button';
import { toast } from 'react-toastify';

/**
 * Profile Security Tab
 * Manage password, 2FA, sessions, and login history
 */
const ProfileSecurityTab = ({ profile, onChangePassword, loading }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Mock active sessions (would come from API)
  const activeSessions = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, USA',
      ip: '192.168.1.1',
      lastActive: '2024-06-15T10:30:00',
      current: true
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, USA',
      ip: '192.168.1.2',
      lastActive: '2024-06-14T15:45:00',
      current: false
    },
    {
      id: '3',
      device: 'Firefox on Mac',
      location: 'Boston, USA',
      ip: '192.168.2.1',
      lastActive: '2024-06-13T09:20:00',
      current: false
    }
  ];

  // Mock login history (would come from API)
  const loginHistory = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, USA',
      ip: '192.168.1.1',
      timestamp: '2024-06-15T10:30:00',
      status: 'success'
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, USA',
      ip: '192.168.1.2',
      timestamp: '2024-06-14T15:45:00',
      status: 'success'
    },
    {
      id: '3',
      device: 'Unknown Device',
      location: 'Unknown',
      ip: '203.0.113.0',
      timestamp: '2024-06-13T22:00:00',
      status: 'failed'
    },
    {
      id: '4',
      device: 'Firefox on Mac',
      location: 'Boston, USA',
      ip: '192.168.2.1',
      timestamp: '2024-06-13T09:20:00',
      status: 'success'
    }
  ];

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await onChangePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      // Error handled by useProfile hook
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Terminate session
  const handleTerminateSession = (sessionId) => {
    // Mock terminate (would call API)
    toast.success('Session terminated successfully');
  };

  // Enable 2FA
  const handleEnable2FA = () => {
    setTwoFactorEnabled(true);
    toast.success('Two-factor authentication enabled');
  };

  // Disable 2FA
  const handleDisable2FA = () => {
    setTwoFactorEnabled(false);
    toast.success('Two-factor authentication disabled');
  };

  // Get device icon
  const getDeviceIcon = (device) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
      return <Smartphone className="w-5 h-5" />;
    }
    if (device.toLowerCase().includes('chrome')) {
      return <Chrome className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Change Password
            </h3>
            <p className="text-sm text-gray-600">
              Update your password regularly to keep your account secure
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            icon={<Lock className="w-4 h-4" />}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              twoFactorEnabled
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>

        {twoFactorEnabled ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Two-factor authentication is enabled. You'll be asked for a verification
              code when signing in from a new device.
            </p>
            <Button variant="outline" onClick={handleDisable2FA}>
              Disable 2FA
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Protect your account with two-factor authentication. You'll need to enter
              a code from your phone in addition to your password.
            </p>
            <Button variant="primary" onClick={handleEnable2FA}>
              Enable 2FA
            </Button>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Active Sessions
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          These devices are currently signed in to your account
        </p>

        <div className="space-y-4">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                  {getDeviceIcon(session.device)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {session.device}
                    </h4>
                    {session.current && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{session.location}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last active: {format(new Date(session.lastActive), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>

              {!session.current && (
                <button
                  onClick={() => handleTerminateSession(session.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Terminate session"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Login History
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Recent login attempts to your account
        </p>

        <div className="space-y-3">
          {loginHistory.map((login) => (
            <div
              key={login.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    login.status === 'success'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {getDeviceIcon(login.device)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {login.device}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        login.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {login.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {login.location} • {login.ip}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(login.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSecurityTab;
