import { useState, useEffect } from 'react';
import { X, Megaphone, Users, Calendar, Mail, Bell, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const SendAnnouncementModal = ({ announcement, onClose }) => {
  const isEditing = !!announcement;
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium',
    targetAudience: 'all',
    publishDate: new Date().toISOString().slice(0, 16),
    expiryDate: '',
    isPinned: false,
    sendEmail: false,
    sendNotification: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        message: announcement.message || '',
        priority: announcement.priority || 'medium',
        targetAudience: announcement.targetAudience || 'all',
        publishDate: announcement.publishDate 
          ? new Date(announcement.publishDate).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        expiryDate: announcement.expiryDate 
          ? new Date(announcement.expiryDate).toISOString().slice(0, 16)
          : '',
        isPinned: announcement.isPinned || false,
        sendEmail: false, // Don't resend emails on edit
        sendNotification: false, // Don't resend notifications on edit
      });
    }
  }, [announcement]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length > 5000) {
      newErrors.message = 'Message cannot exceed 5000 characters';
    }

    if (formData.expiryDate && new Date(formData.expiryDate) <= new Date(formData.publishDate)) {
      newErrors.expiryDate = 'Expiry date must be after publish date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        publishDate: new Date(formData.publishDate).toISOString(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
      };

      let response;
      if (isEditing) {
        response = await api.put(`/admin/announcements/${announcement._id}`, payload);
      } else {
        response = await api.post('/admin/announcements', payload);
      }

      if (response.data.success) {
        toast.success(isEditing ? 'Announcement updated successfully' : 'Announcement created successfully');
        onClose();
      }
    } catch (error) {
      console.error('Failed to save announcement:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save announcement';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        {/* Center modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter announcement title"
                  maxLength={200}
                />
                <div className="flex justify-between mt-1">
                  {errors.title && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                    {formData.title.length}/200
                  </p>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  rows={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                    errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter your announcement message"
                  maxLength={5000}
                />
                <div className="flex justify-between mt-1">
                  {errors.message && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.message}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                    {formData.message.length}/5000
                  </p>
                </div>
              </div>

              {/* Priority and Target Audience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Target Audience
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => handleChange('targetAudience', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Users</option>
                    <option value="students">Students</option>
                    <option value="instructors">Instructors</option>
                    <option value="admins">Admins</option>
                  </select>
                </div>
              </div>

              {/* Publish Date and Expiry Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Publish Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.publishDate}
                    onChange={(e) => handleChange('publishDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiryDate}
                    onChange={(e) => handleChange('expiryDate', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.expiryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.expiryDate && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.expiryDate}</p>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPinned"
                      checked={formData.isPinned}
                      onChange={(e) => handleChange('isPinned', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isPinned" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pin this announcement
                    </label>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Pinned announcements appear at the top
                  </span>
                </div>

                {!isEditing && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="sendNotification"
                          checked={formData.sendNotification}
                          onChange={(e) => handleChange('sendNotification', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="sendNotification" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Bell className="w-4 h-4" />
                          Send notification to users
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="sendEmail"
                          checked={formData.sendEmail}
                          onChange={(e) => handleChange('sendEmail', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="sendEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          Send email to users
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Megaphone className="w-5 h-5" />
                    {isEditing ? 'Update Announcement' : 'Create Announcement'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendAnnouncementModal;
