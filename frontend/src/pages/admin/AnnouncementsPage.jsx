import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Megaphone, Eye, Edit, Trash2, Pin, Calendar, Users, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import SendAnnouncementModal from '../../components/admin/SendAnnouncementModal';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAudience, setFilterAudience] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
    fetchStats();
  }, [currentPage, searchTerm, filterPriority, filterAudience, filterActive]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filterPriority && { priority: filterPriority }),
        ...(filterAudience && { targetAudience: filterAudience }),
        ...(filterActive && { isActive: filterActive })
      });

      const response = await api.get(`/admin/announcements?${params}`);
      
      if (response.data.success) {
        setAnnouncements(response.data.data.announcements);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/announcements/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/announcements/${id}`);
      
      if (response.data.success) {
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleTogglePin = async (announcement) => {
    try {
      const response = await api.put(`/admin/announcements/${announcement._id}`, {
        isPinned: !announcement.isPinned
      });
      
      if (response.data.success) {
        toast.success(announcement.isPinned ? 'Announcement unpinned' : 'Announcement pinned');
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      toast.error('Failed to update announcement');
    }
  };

  const handleToggleActive = async (announcement) => {
    try {
      const response = await api.put(`/admin/announcements/${announcement._id}`, {
        isActive: !announcement.isActive
      });
      
      if (response.data.success) {
        toast.success(announcement.isActive ? 'Announcement deactivated' : 'Announcement activated');
        fetchAnnouncements();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to toggle active:', error);
      toast.error('Failed to update announcement');
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
    fetchAnnouncements();
    fetchStats();
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[priority] || colors.medium;
  };

  const getAudienceLabel = (audience) => {
    const labels = {
      all: 'All Users',
      students: 'Students',
      instructors: 'Instructors',
      admins: 'Admins',
      custom: 'Custom'
    };
    return labels[audience] || audience;
  };

  if (loading && announcements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage platform announcements
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Announcement
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAnnouncements}</p>
              </div>
              <Megaphone className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeAnnouncements}</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pinned</p>
                <p className="text-2xl font-bold text-purple-600">{stats.pinnedAnnouncements}</p>
              </div>
              <Pin className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
                <p className="text-2xl font-bold text-gray-600">{stats.expiredAnnouncements}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => {
              setFilterPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={filterAudience}
            onChange={(e) => {
              setFilterAudience(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Audiences</option>
            <option value="all">All Users</option>
            <option value="students">Students</option>
            <option value="instructors">Instructors</option>
            <option value="admins">Admins</option>
            <option value="custom">Custom</option>
          </select>

          <select
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow">
            <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No announcements found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first announcement to communicate with users
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Announcement
            </button>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {announcement.isPinned && (
                      <Pin className="w-5 h-5 text-purple-600" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {announcement.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      announcement.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {announcement.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {announcement.message}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{getAudienceLabel(announcement.targetAudience)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{announcement.viewCount} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(announcement.publishDate), 'MMM d, yyyy')}</span>
                    </div>
                    {announcement.expiryDate && (
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>Expires {format(new Date(announcement.expiryDate), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleTogglePin(announcement)}
                    className={`p-2 rounded-lg transition-colors ${
                      announcement.isPinned
                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                    title={announcement.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => handleToggleActive(announcement)}
                    className={`p-2 rounded-lg transition-colors ${
                      announcement.isActive
                        ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                    }`}
                    title={announcement.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(announcement._id)}
                    className="p-2 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <SendAnnouncementModal
          announcement={editingAnnouncement}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default AnnouncementsPage;
