import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TicketDetails from '../components/TicketDetails';
import supportService from '../services/supportService';
import { toast } from 'react-hot-toast';

/**
 * InstructorTicketDetailPage
 * Detailed view of a support ticket for instructors
 * Provides full ticket management capabilities
 */
const InstructorTicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  /**
   * Handle status update
   */
  const handleStatusUpdate = async (ticketId, status) => {
    try {
      await supportService.updateTicketStatus(ticketId, status);
      toast.success('Ticket status updated successfully');
      return true;
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update ticket status');
      return false;
    }
  };

  /**
   * Handle ticket assignment
   */
  const handleAssign = async (ticketId, userId) => {
    try {
      await supportService.assignTicket(ticketId, userId);
      toast.success('Ticket assigned successfully');
      return true;
    } catch (err) {
      console.error('Failed to assign ticket:', err);
      toast.error('Failed to assign ticket');
      return false;
    }
  };

  /**
   * Handle ticket close
   */
  const handleClose = async (ticketId, resolution) => {
    try {
      await supportService.closeTicket(ticketId, { resolution });
      toast.success('Ticket closed successfully');
      return true;
    } catch (err) {
      console.error('Failed to close ticket:', err);
      toast.error('Failed to close ticket');
      return false;
    }
  };

  /**
   * Handle ticket delete
   * Instructors cannot delete tickets (admin only)
   */
  const handleDelete = async (ticketId) => {
    toast.error('Only administrators can delete tickets');
    return false;
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    navigate('/instructor/support');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TicketDetails
        ticketId={id}
        currentUser={user}
        onBack={handleBack}
        onUpdateStatus={handleStatusUpdate}
        onAssign={handleAssign}
        onClose={handleClose}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default InstructorTicketDetailPage;
