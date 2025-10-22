import React, { useState } from 'react';
import { X, Paperclip, AlertCircle, Loader2 } from 'lucide-react';
import FilePreview from './FilePreview';

/**
 * CreateTicketModal Component
 * Modal form for creating new support tickets
 * 
 * Props:
 * - isOpen: Whether modal is visible
 * - onClose: Close callback
 * - onSubmit: Submit callback
 * - loading: Loading state
 */
const CreateTicketModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: 'technical',
    priority: 'medium',
    message: '',
    email: ''
  });
  const [attachment, setAttachment] = useState(null);
  const [errors, setErrors] = useState({});

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip'
  ];

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ ...prev, attachment: 'File size must be less than 10MB' }));
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        attachment: 'Invalid file type. Allowed: Images, PDF, Word, Text, ZIP' 
      }));
      return;
    }

    setAttachment(file);
    setErrors(prev => ({ ...prev, attachment: '' }));
    e.target.value = ''; // Reset input
  };

  /**
   * Validate form
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.subject) {
      newErrors.subject = 'Please select a category';
    }

    if (!formData.priority) {
      newErrors.priority = 'Please select a priority';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.length > 5000) {
      newErrors.message = 'Message must be less than 5000 characters';
    }

    // Email is optional but if provided, validate format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await onSubmit({ ...formData, attachment });
      
      // Reset form on success
      setFormData({
        title: '',
        subject: 'technical',
        priority: 'medium',
        message: '',
        email: ''
      });
      setAttachment(null);
      setErrors({});
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form
      setTimeout(() => {
        setFormData({
          title: '',
          subject: 'technical',
          priority: 'medium',
          message: '',
          email: ''
        });
        setAttachment(null);
        setErrors({});
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Support Ticket</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
                placeholder="Brief summary of your issue"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                    errors.subject ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="technical">🔧 Technical Support</option>
                  <option value="billing">💳 Billing & Payments</option>
                  <option value="account">👤 Account Issues</option>
                  <option value="feature-request">✨ Feature Request</option>
                  <option value="bug-report">🐛 Bug Report</option>
                  <option value="other">📝 Other</option>
                </select>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                    errors.priority ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="medium">Medium - Normal issue</option>
                  <option value="high">High - Important issue</option>
                  <option value="urgent">Urgent - Critical issue</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.priority}
                  </p>
                )}
              </div>
            </div>

            {/* Email (optional) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="your.email@example.com"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                We'll use this to send you updates about your ticket
              </p>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Issue <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                disabled={loading}
                rows={6}
                placeholder="Please provide as much detail as possible about your issue..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none disabled:bg-gray-50 disabled:text-gray-500 ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.message}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.message.length}/5000 characters
              </p>
            </div>

            {/* Attachment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachment <span className="text-gray-400">(Optional)</span>
              </label>
              
              {attachment ? (
                <FilePreview
                  file={attachment}
                  onRemove={() => setAttachment(null)}
                />
              ) : (
                <div>
                  <label
                    htmlFor="attachment"
                    className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition"
                  >
                    <div className="text-center">
                      <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Images, PDF, Word, Text, ZIP (Max 10MB)
                      </p>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="attachment"
                    onChange={handleFileSelect}
                    disabled={loading}
                    className="hidden"
                    accept={ALLOWED_FILE_TYPES.join(',')}
                  />
                </div>
              )}
              
              {errors.attachment && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.attachment}
                </p>
              )}
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                What happens next?
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your ticket will be assigned to a support team member</li>
                <li>• You'll receive email notifications for any updates</li>
                <li>• You can chat in real-time once assigned</li>
                <li>• Average response time: 2-4 hours</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Ticket</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
