import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

/**
 * Profile validation schema
 */
const profileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  instituteCode: Yup.string(),
  profilePic: Yup.string().url('Must be a valid URL'),
});

/**
 * Password validation schema
 */
const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

/**
 * StudentProfile Component
 * @description User profile management
 */
const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile'); // profile, password

  /**
   * Handle profile update
   */
  const handleProfileUpdate = async (values, { setSubmitting }) => {
    try {
      const response = await authAPI.updateProfile({
        name: values.name,
        instituteCode: values.instituteCode,
        profilePic: values.profilePic,
      });

      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle password change
   */
  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    try {
      await authAPI.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success('Password changed successfully!');
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            {/* Profile Picture */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {user?.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`
                  w-full text-left px-4 py-2 rounded-lg transition-colors
                  ${activeTab === 'profile'
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`
                  w-full text-left px-4 py-2 rounded-lg transition-colors
                  ${activeTab === 'password'
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                Change Password
              </button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'profile' ? (
            <ProfileForm user={user} onSubmit={handleProfileUpdate} />
          ) : (
            <PasswordForm onSubmit={handlePasswordChange} />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * ProfileForm Component
 */
const ProfileForm = ({ user, onSubmit }) => {
  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Profile Information
      </h2>

      <Formik
        initialValues={{
          name: user?.name || '',
          instituteCode: user?.instituteCode || '',
          profilePic: user?.profilePic || '',
        }}
        validationSchema={profileSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ errors, touched, isSubmitting, values, handleChange, handleBlur }) => (
          <Form className="space-y-6">
            {/* Email (Read-only) */}
            <Input
              label="Email"
              type="email"
              value={user?.email}
              disabled
              helperText="Email cannot be changed"
            />

            {/* Name */}
            <Input
              label="Full Name"
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name && errors.name}
            />

            {/* Institute Code */}
            <Input
              label="Institute Code (Optional)"
              name="instituteCode"
              type="text"
              value={values.instituteCode}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.instituteCode && errors.instituteCode}
            />

            {/* Profile Picture URL */}
            <Input
              label="Profile Picture URL (Optional)"
              name="profilePic"
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={values.profilePic}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.profilePic && errors.profilePic}
              helperText="Enter a URL to your profile picture"
            />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

/**
 * PasswordForm Component
 */
const PasswordForm = ({ onSubmit }) => {
  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Change Password
      </h2>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Password Requirements:</strong>
        </p>
        <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
          <li>Minimum 6 characters</li>
          <li>Mix of letters and numbers recommended</li>
          <li>Avoid using common words or personal information</li>
        </ul>
      </div>

      <Formik
        initialValues={{
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }}
        validationSchema={passwordSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched, isSubmitting, values, handleChange, handleBlur }) => (
          <Form className="space-y-6">
            {/* Current Password */}
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={values.currentPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.currentPassword && errors.currentPassword}
            />

            {/* New Password */}
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={values.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.newPassword && errors.newPassword}
            />

            {/* Confirm Password */}
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && errors.confirmPassword}
            />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default StudentProfile;
