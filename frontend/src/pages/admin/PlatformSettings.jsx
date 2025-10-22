import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/api';
import { Upload, Save, AlertCircle, Trash2 } from 'react-feather';
import ConfirmModal from '../../components/common/ConfirmModal';

const PlatformSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  
  // Branding state
  const [branding, setBranding] = useState({
    instituteName: '',
    logoUrl: '',
    faviconUrl: '',
    bannerUrl: '',
    primaryColor: '#5B5FEF',
    secondaryColor: '#FFA500',
    accentColor: '#10B981',
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  
  // Archive settings
  const [monthsOld, setMonthsOld] = useState(12);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getBranding();
      if (response.success && response.data.branding) {
        setBranding(response.data.branding);
        setLogoPreview(response.data.branding.logoUrl);
        setFaviconPreview(response.data.branding.faviconUrl);
        setBannerPreview(response.data.branding.bannerUrl);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch branding settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(reader.result);
      } else if (type === 'favicon') {
        setFaviconFile(file);
        setFaviconPreview(reader.result);
      } else if (type === 'banner') {
        setBannerFile(file);
        setBannerPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBrandingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const formData = new FormData();
      
      // Append text fields
      formData.append('instituteName', branding.instituteName);
      formData.append('primaryColor', branding.primaryColor);
      formData.append('secondaryColor', branding.secondaryColor);
      formData.append('accentColor', branding.accentColor);
      
      // Append files if selected
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      if (faviconFile) {
        formData.append('favicon', faviconFile);
      }
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }
      
      const response = await adminAPI.updateBranding(formData);
      
      if (response.success) {
        toast.success('Branding updated successfully');
        fetchBranding();
        setLogoFile(null);
        setFaviconFile(null);
        setBannerFile(null);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update branding');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveData = async () => {
    try {
      setSaving(true);
      const response = await adminAPI.archiveOldData({ monthsOld });
      
      if (response.success) {
        toast.success(
          `Archived ${response.data.archivedAssessments} assessments and deleted ${response.data.deletedLogs} logs`
        );
        setShowArchiveModal(false);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to archive data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Platform Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure platform branding and data management
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('branding')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'branding'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
          >
            Branding
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'data'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
          >
            Data Management
          </button>
        </nav>
      </div>

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <form onSubmit={handleBrandingSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Institute Information
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Institute Name
              </label>
              <input
                type="text"
                value={branding.instituteName}
                onChange={(e) => setBranding({ ...branding, instituteName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter institute name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo
                </label>
                {logoPreview && (
                  <div className="mb-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <img src={logoPreview} alt="Logo preview" className="max-h-20 object-contain" />
                  </div>
                )}
                <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400">
                  <Upload className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {logoFile ? logoFile.name : 'Upload Logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logo')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Favicon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Favicon
                </label>
                {faviconPreview && (
                  <div className="mb-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <img src={faviconPreview} alt="Favicon preview" className="max-h-20 object-contain" />
                  </div>
                )}
                <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400">
                  <Upload className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {faviconFile ? faviconFile.name : 'Upload Favicon'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'favicon')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Banner
                </label>
                {bannerPreview && (
                  <div className="mb-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <img src={bannerPreview} alt="Banner preview" className="max-h-20 object-contain" />
                  </div>
                )}
                <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400">
                  <Upload className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {bannerFile ? bannerFile.name : 'Upload Banner'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'banner')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
              Theme Colors
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Saving...' : 'Save Branding'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Data Management Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Archive Old Data
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Archive assessments and clean up old activity logs to optimize database performance.
            </p>
            
            <div className="flex items-center space-x-4 mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Archive data older than:
              </label>
              <select
                value={monthsOld}
                onChange={(e) => setMonthsOld(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={18}>18 months</option>
                <option value={24}>24 months</option>
              </select>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Warning
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    This action will archive old assessments and delete activity logs. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowArchiveModal(true)}
              className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Archive Old Data
            </button>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      <ConfirmModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchiveData}
        title="Archive Old Data"
        message={`Are you sure you want to archive data older than ${monthsOld} months? This action cannot be undone.`}
        confirmText="Archive Data"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        loading={saving}
      />
    </div>
  );
};

export default PlatformSettings;
