import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupport } from '../hooks/useSupport';
import { useAuth } from '../context/AuthContext';
import TicketList from '../components/TicketList';
import CreateTicketModal from '../components/CreateTicketModal';
import Footer from '../components/Footer';
import { toast } from 'react-hot-toast';

/**
 * StudentSupportPage
 * Main support page for students to view and create tickets
 */
const StudentSupportPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    tickets,
    stats,
    filters,
    loading,
    error,
    hasMore,
    actions
  } = useSupport({
    role: 'student',
    autoFetch: true
  });

  /**
   * Handle create ticket
   */
  const handleCreateTicket = async (ticketData) => {
    try {
      const newTicket = await actions.createTicket(ticketData);
      setShowCreateModal(false);
      toast.success('Ticket created successfully!');
      
      // Navigate to ticket detail page
      navigate(`/student/support/${newTicket._id}`);
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast.error('Failed to create ticket. Please try again.');
    }
  };

  /**
   * Handle ticket click
   */
  const handleTicketClick = (ticket) => {
    navigate(`/student/support/${ticket._id}`);
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (newFilters) => {
    actions.updateFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <TicketList
          tickets={tickets}
          loading={loading}
          error={error}
          hasMore={hasMore}
          filters={filters}
          onFilterChange={handleFilterChange}
          onLoadMore={actions.loadMore}
          onRefresh={actions.refresh}
          onCreateTicket={() => setShowCreateModal(true)}
          onTicketClick={handleTicketClick}
          showFilters={true}
          emptyMessage="You haven't created any support tickets yet"
          currentUser={user}
        />
      </div>

      <Footer />

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
};

export default StudentSupportPage;
