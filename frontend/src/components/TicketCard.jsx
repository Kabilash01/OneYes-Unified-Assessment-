import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Clock, 
  User, 
  MessageSquare, 
  Paperclip,
  AlertCircle,
  CheckCircle,
  XCircle,
  Circle
} from 'lucide-react';

/**
 * TicketCard Component
 * Displays a single ticket in compact card format
 * 
 * Props:
 * - ticket: Ticket object
 * - onClick: Click handler
 * - viewMode: 'grid' | 'list'
 * - currentUser: Logged in user
 */
const TicketCard = ({ ticket, onClick, viewMode = 'grid', currentUser }) => {
  /**
   * Get status color and icon
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
   * Get priority color and label
   */
  const getPriorityInfo = (priority) => {
    const priorityMap = {
      'low': {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        label: 'Low'
      },
      'medium': {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'Medium'
      },
      'high': {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        label: 'High'
      },
      'urgent': {
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'Urgent',
        icon: AlertCircle
      }
    };
    return priorityMap[priority] || priorityMap['low'];
  };

  /**
   * Get subject icon and color
   */
  const getSubjectInfo = (subject) => {
    const subjectMap = {
      'technical': { emoji: '🔧', color: 'text-blue-600' },
      'billing': { emoji: '💳', color: 'text-green-600' },
      'account': { emoji: '👤', color: 'text-purple-600' },
      'feature-request': { emoji: '✨', color: 'text-yellow-600' },
      'bug-report': { emoji: '🐛', color: 'text-red-600' },
      'other': { emoji: '📝', color: 'text-gray-600' }
    };
    return subjectMap[subject] || subjectMap['other'];
  };

  const statusInfo = getStatusInfo(ticket.status);
  const priorityInfo = getPriorityInfo(ticket.priority);
  const subjectInfo = getSubjectInfo(ticket.subject);
  const StatusIcon = statusInfo.icon;
  const PriorityIcon = priorityInfo.icon;

  /**
   * Check if ticket has unread messages
   */
  const hasUnread = ticket.unreadCount > 0;

  /**
   * Check if user is assigned to ticket
   */
  const isAssigned = ticket.assignedTo?._id === currentUser?._id;

  /**
   * Grid view card
   */
  if (viewMode === 'grid') {
    return (
      <div
        onClick={onClick}
        className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition hover:shadow-md hover:border-indigo-300 ${
          hasUnread ? 'border-indigo-500' : 'border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-500">
                #{ticket.ticketNumber}
              </span>
              {hasUnread && (
                <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                  {ticket.unreadCount} new
                </span>
              )}
              {isAssigned && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  Assigned to me
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {ticket.title || ticket.subject}
            </h3>
          </div>
        </div>

        {/* Message preview */}
        {ticket.message && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {ticket.message}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`${priorityInfo.bg} ${priorityInfo.text} px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1`}>
              {PriorityIcon && <PriorityIcon className="w-3 h-3" />}
              <span>{priorityInfo.label}</span>
            </span>
            <span className={`${statusInfo.bg} ${statusInfo.text} px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1`}>
              <StatusIcon className="w-3 h-3" />
              <span>{statusInfo.label}</span>
            </span>
          </div>
          <span className="text-xl" title={ticket.subject}>
            {subjectInfo.emoji}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Message count */}
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>{ticket.messageCount || 0}</span>
            </div>

            {/* Attachment indicator */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip className="w-4 h-4" />
                <span>{ticket.attachments.length}</span>
              </div>
            )}
          </div>

          {/* Last activity */}
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Assigned user */}
        {ticket.assignedTo && (
          <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Assigned to <span className="font-medium text-gray-900">{ticket.assignedTo.name}</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  /**
   * List view card
   */
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition hover:shadow-md hover:border-indigo-300 ${
        hasUnread ? 'border-indigo-500' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Subject emoji */}
          <div className="text-2xl flex-shrink-0">
            {subjectInfo.emoji}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-500">
                #{ticket.ticketNumber}
              </span>
              {hasUnread && (
                <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                  {ticket.unreadCount} new
                </span>
              )}
              {isAssigned && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  Assigned to me
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
              {ticket.title || ticket.subject}
            </h3>
            <p className="text-gray-600 text-sm truncate">
              {ticket.message}
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-6 flex-shrink-0 ml-4">
          {/* Priority */}
          <span className={`${priorityInfo.bg} ${priorityInfo.text} px-3 py-1 rounded-md text-xs font-medium flex items-center space-x-1`}>
            {PriorityIcon && <PriorityIcon className="w-3 h-3" />}
            <span>{priorityInfo.label}</span>
          </span>

          {/* Status */}
          <span className={`${statusInfo.bg} ${statusInfo.text} px-3 py-1 rounded-md text-xs font-medium flex items-center space-x-1 min-w-[100px] justify-center`}>
            <StatusIcon className="w-3 h-3" />
            <span>{statusInfo.label}</span>
          </span>

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>{ticket.messageCount || 0}</span>
            </div>
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip className="w-4 h-4" />
                <span>{ticket.attachments.length}</span>
              </div>
            )}
          </div>

          {/* Last activity */}
          <div className="flex items-center space-x-1 text-sm text-gray-500 min-w-[120px]">
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
          </div>

          {/* Assigned user */}
          {ticket.assignedTo && (
            <div className="flex items-center space-x-2 min-w-[150px]">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 truncate">
                {ticket.assignedTo.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
