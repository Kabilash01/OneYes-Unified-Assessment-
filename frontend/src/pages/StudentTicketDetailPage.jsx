import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import supportService from '../services/supportService';
import ChatWindow from '../components/ChatWindow';
import Footer from '../components/Footer';
import { toast } from 'react-hot-toast';

/**
 * StudentTicketDetailPage
 * Detailed view of a support ticket for students
 * Shows ticket info and chat interface
 */
const StudentTicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [resolution, setResolution] = useState('');
  const [closing, setClosing] = useState(false);

  const chat = useChat(id);

  /**
   * Fetch ticket details
   */
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await supportService.getTicketById(id);
        setTicket(data);
      } catch (err) {
        console.error('Failed to fetch ticket:', err);
        setError(err.message || 'Failed to load ticket');
        toast.error('Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTicket();
    }
  }, [id]);

  /**
   * Handle close ticket
   */
  const handleCloseTicket = async () => {
    if (!resolution.trim()) {
      toast.error('Please provide a resolution summary');
      return;
    }

    try {
      setClosing(true);
      await supportService.closeTicket(id, { resolution });
      
      toast.success('Ticket closed successfully');
      setShowCloseDialog(false);
      
      // Refresh ticket data
      const updatedTicket = await supportService.getTicketById(id);
      setTicket(updatedTicket);
    } catch (err) {
      console.error('Failed to close ticket:', err);
      toast.error('Failed to close ticket');
    } finally {
      setClosing(false);
    }
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { color: 'bg-blue-100 text-blue-800', label: 'Open' },
      'in-progress': { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      resolved: { color: 'bg-green-100 text-green-800', label: 'Resolved' },
      closed: { color: 'bg-gray-100 text-gray-800', label: 'Closed' }
    };

    const config = statusConfig[status] || statusConfig.open;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  /**
   * Get priority badge
   */
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
      medium: { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  /**
   * Format date
   */
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Ticket not found'}</p>
          <button
            onClick={() => navigate('/student/support')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Support
          </button>
        </div>
      </div>
    );
  }

  // Check if student is the owner
  const isOwner = ticket.createdBy._id === user?._id;

  // Only show close button if ticket is not already closed and student is owner
  const canClose = isOwner && ticket.status !== 'closed';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button and title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/student/support')}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {ticket.title}
                </h1>
                <p className="text-sm text-gray-500">
                  Ticket #{ticket.ticketNumber}
                </p>
              </div>
            </div>

            {/* Right: Status, Priority, and Actions */}
            <div className="flex items-center space-x-3">
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}

              {canClose && (
                <button
                  onClick={() => setShowCloseDialog(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Close Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content: Chat */}
          <div className="lg:col-span-2">
            <ChatWindow
              ticketId={id}
              ticket={ticket}
              currentUser={user}
              chat={chat}
            />
          </div>

          {/* Sidebar: Ticket info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              {/* Ticket Details */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Ticket Details
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Category</dt>
                    <dd className="mt-1 text-sm text-gray-900">{ticket.subject}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(ticket.createdAt)}</dd>
                  </div>
                  {ticket.assignedTo && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Assigned to</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                      </dd>
                    </div>
                  )}
                  {ticket.email && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Contact Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{ticket.email}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Attachments */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Attachments
                  </h3>
                  <div className="space-y-2">
                    {ticket.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm text-gray-900 truncate">
                          {attachment.filename}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {(attachment.size / 1024).toFixed(2)} KB
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution (if closed) */}
              {ticket.status === 'closed' && ticket.resolution && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Resolution
                  </h3>
                  <p className="text-sm text-gray-600">{ticket.resolution}</p>
                  {ticket.resolvedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Resolved on {formatDate(ticket.resolvedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Close Ticket Dialog */}
      {showCloseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Close Ticket
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a brief summary of how this issue was resolved.
            </p>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Enter resolution summary..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={4}
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCloseDialog(false);
                  setResolution('');
                }}
                disabled={closing}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseTicket}
                disabled={closing || !resolution.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {closing && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Close Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTicketDetailPage;
