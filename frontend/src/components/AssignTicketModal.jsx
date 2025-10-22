import React, { useState, useEffect } from 'react';
import { X, Search, User, Loader2, Check } from 'lucide-react';
import api from '../services/api';

/**
 * AssignTicketModal Component
 * Modal for assigning tickets to instructors/admins
 * 
 * Props:
 * - isOpen: Whether modal is visible
 * - onClose: Close callback
 * - onAssign: Assign callback (userId)
 * - currentAssignee: Currently assigned user object
 */
const AssignTicketModal = ({ isOpen, onClose, onAssign, currentAssignee }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(currentAssignee?._id || null);

  /**
   * Fetch instructors and admins
   */
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  /**
   * Filter users based on search
   */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  /**
   * Fetch users from API
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch instructors and admins
      const response = await api.get('/api/users', {
        params: {
          role: 'instructor,admin',
          limit: 100
        }
      });
      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle assign
   */
  const handleAssign = async () => {
    if (!selectedUserId) return;

    try {
      setAssigning(true);
      await onAssign(selectedUserId);
      onClose();
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    } finally {
      setAssigning(false);
    }
  };

  /**
   * Get user initials
   */
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Get role badge color
   */
  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      instructor: 'bg-purple-100 text-purple-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Assign Ticket</h2>
          <button
            onClick={onClose}
            disabled={assigning}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="overflow-y-auto max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery ? 'No users found matching your search' : 'No instructors or admins available'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Unassign option */}
              <div
                onClick={() => setSelectedUserId(null)}
                className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition ${
                  selectedUserId === null ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <X className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Unassigned</p>
                      <p className="text-sm text-gray-500">Remove current assignment</p>
                    </div>
                  </div>
                  {selectedUserId === null && (
                    <Check className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
              </div>

              {/* User options */}
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUserId(user._id)}
                  className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedUserId === user._id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                          {getInitials(user.name)}
                        </div>
                      )}

                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                          {currentAssignee?._id === user._id && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {selectedUserId === user._id && (
                      <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedUserId ? (
              <span>
                Assigning to{' '}
                <span className="font-medium text-gray-900">
                  {users.find((u) => u._id === selectedUserId)?.name || 'selected user'}
                </span>
              </span>
            ) : (
              <span>Ticket will be unassigned</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={assigning}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={assigning || selectedUserId === currentAssignee?._id}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {assigning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <span>Assign Ticket</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTicketModal;
