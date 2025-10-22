import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import ChatWindow from './ChatWindow';
import AssignTicketModal from './AssignTicketModal';
import {
  ArrowLeft,
  Clock,
  User,
  Mail,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Circle,
  Edit2,
  Trash2,
  UserPlus,
  Check,
  X as XIcon,
  Paperclip,
  Download
} from 'lucide-react';

/**
 * TicketDetails Component
 * Full ticket view with chat, actions, and metadata
 * 
 * Props:
 * - ticket: Ticket object
 * - currentUser: Logged in user
 * - onBack: Back button callback
 * - onUpdateStatus: Update status callback
 * - onAssign: Assign ticket callback
 * - onClose: Close ticket callback
 * - onDelete: Delete ticket callback
 * - loading: Loading state
 */
const TicketDetails = ({
  ticket,
  currentUser,
  onBack,
  onUpdateStatus,
  onAssign,
  onClose,
  onDelete,
  loading = false
}) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [resolution, setResolution] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(ticket.status);

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Ticket not found</p>
        </div>
      </div>
    );
  }

  /**
   * Get status info
   */
  const getStatusInfo = (status) => {
    const statusMap = {
      'open': {
        color: 'blue',
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: Circle,
        label: 'Open'
      },
      'in-progress': {
        color: 'yellow',
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'In Progress'
      },
      'resolved': {
        color: 'green',
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Resolved'
      },
      'closed': {
        color: 'gray',
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: XCircle,
        label: 'Closed'
      }
    };
    return statusMap[status] || statusMap['open'];
  };

  /**
   * Get priority info
   */
  const getPriorityInfo = (priority) => {
    const priorityMap = {
      'low': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Low' },
      'medium': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Medium' },
      'high': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'High' },
      'urgent': { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgent', icon: AlertCircle }
    };
    return priorityMap[priority] || priorityMap['low'];
  };

  const statusInfo = getStatusInfo(ticket.status);
  const priorityInfo = getPriorityInfo(ticket.priority);
  const StatusIcon = statusInfo.icon;
  const PriorityIcon = priorityInfo.icon;

  const isAdmin = currentUser?.role === 'admin';
  const isInstructor = currentUser?.role === 'instructor';
  const isOwner = ticket.userId?._id === currentUser?._id;
  const isAssigned = ticket.assignedTo?._id === currentUser?._id;
  const canEdit = isAdmin || isInstructor || isOwner;
  const canAssign = isAdmin || isInstructor;
  const canDelete = isAdmin;

  /**
   * Handle status change
   */
  const handleStatusChange = async (newStatus) => {
    if (newStatus === selectedStatus) return;
    
    setSelectedStatus(newStatus);
    await onUpdateStatus?.(ticket._id, newStatus);
  };

  /**
   * Handle close ticket
   */
  const handleCloseTicket = async () => {
    if (!resolution.trim()) {
      alert('Please provide a resolution summary');
      return;
    }

    await onClose?.(ticket._id, resolution);
    setShowCloseDialog(false);
    setResolution('');
  };

  /**
   * Handle assign ticket
   */
  const handleAssign = async (userId) => {
    await onAssign?.(ticket._id, userId);
    setShowAssignModal(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Back button */}
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Back to tickets"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Ticket info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {ticket.title || ticket.subject}
                </h1>
                <span className="text-sm font-medium text-gray-500">
                  #{ticket.ticketNumber}
                </span>
              </div>
              <div className="flex items-center space-x-3 flex-wrap">
                {/* Status badge */}
                <span className={`${statusInfo.bg} ${statusInfo.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1`}>
                  <StatusIcon className="w-3 h-3" />
                  <span>{statusInfo.label}</span>
                </span>

                {/* Priority badge */}
                <span className={`${priorityInfo.bg} ${priorityInfo.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1`}>
                  {PriorityIcon && <PriorityIcon className="w-3 h-3" />}
                  <span>{priorityInfo.label}</span>
                </span>

                {/* Created time */}
                <span className="text-sm text-gray-500 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Status dropdown */}
            {canEdit && ticket.status !== 'closed' && (
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            )}

            {/* Assign button */}
            {canAssign && ticket.status !== 'closed' && (
              <button
                onClick={() => setShowAssignModal(true)}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>Assign</span>
              </button>
            )}

            {/* Close button */}
            {canEdit && ticket.status !== 'closed' && (
              <button
                onClick={() => setShowCloseDialog(true)}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Close Ticket</span>
              </button>
            )}

            {/* Delete button */}
            {canDelete && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this ticket?')) {
                    onDelete?.(ticket._id);
                  }
                }}
                disabled={loading}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                title="Delete ticket"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main chat area */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow
            ticketId={ticket._id}
            ticket={ticket}
            currentUser={currentUser}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Ticket details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Ticket Details
              </h3>
              
              <div className="space-y-4">
                {/* Creator */}
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500">Created By</p>
                    <p className="text-sm text-gray-900 truncate">
                      {ticket.userId?.name || 'Unknown'}
                    </p>
                  </div>
                </div>

                {/* Email */}
                {ticket.email && (
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">Contact Email</p>
                      <a
                        href={`mailto:${ticket.email}`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 truncate block"
                      >
                        {ticket.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Category */}
                <div className="flex items-start space-x-3">
                  <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p className="text-sm text-gray-900 capitalize">
                      {ticket.subject.replace('-', ' ')}
                    </p>
                  </div>
                </div>

                {/* Assigned to */}
                {ticket.assignedTo && (
                  <div className="flex items-start space-x-3">
                    <UserPlus className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">Assigned To</p>
                      <p className="text-sm text-gray-900 truncate">
                        {ticket.assignedTo.name}
                      </p>
                      {ticket.assignedTo.email && (
                        <p className="text-xs text-gray-500 truncate">
                          {ticket.assignedTo.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Paperclip className="w-5 h-5 text-gray-400" />
                      <p className="text-sm font-medium text-gray-500">
                        Attachments ({ticket.attachments.length})
                      </p>
                    </div>
                    <div className="space-y-2 pl-7">
                      {ticket.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          download={attachment.originalName}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                        >
                          <span className="text-sm text-gray-700 truncate flex-1">
                            {attachment.originalName}
                          </span>
                          <Download className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Timeline
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ticket Created</p>
                    <p className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {ticket.respondedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">First Response</p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.respondedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {ticket.resolvedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Resolved</p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {ticket.closedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Closed</p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.closedAt).toLocaleString()}
                      </p>
                      {ticket.resolution && (
                        <p className="text-sm text-gray-700 mt-1 p-2 bg-gray-50 rounded">
                          {ticket.resolution}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <AssignTicketModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssign}
          currentAssignee={ticket.assignedTo}
        />
      )}

      {/* Close Dialog */}
      {showCloseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Close Ticket
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide a resolution summary before closing this ticket.
              </p>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={4}
                placeholder="Describe how this issue was resolved..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCloseDialog(false);
                  setResolution('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseTicket}
                disabled={!resolution.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
