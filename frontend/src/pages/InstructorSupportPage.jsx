import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupport } from '../hooks/useSupport';
import { useAuth } from '../context/AuthContext';
import TicketList from '../components/TicketList';
import SupportDashboard from '../components/SupportDashboard';
import Footer from '../components/Footer';
import { toast } from 'react-hot-toast';
import { LayoutDashboard, List } from 'lucide-react';

/**
 * InstructorSupportPage
 * Support page for instructors to manage assigned tickets
 */
const InstructorSupportPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState('tickets'); // 'dashboard' or 'tickets'

  const {
    tickets,
    stats,
    filters,
    loading,
    error,
    hasMore,
    actions
  } = useSupport({
    role: 'instructor',
    autoFetch: true,
    fetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  /**
   * Handle ticket click
   */
  const handleTicketClick = (ticket) => {
    navigate(`/instructor/support/${ticket._id}`);
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
        {/* Header with view toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and respond to student support requests
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setView('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                view === 'dashboard'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setView('tickets')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                view === 'tickets'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Tickets</span>
            </button>
          </div>
        </div>

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <SupportDashboard
            stats={stats}
            tickets={tickets}
            loading={loading}
            onTicketClick={handleTicketClick}
            onRefresh={actions.refresh}
          />
        )}

        {/* Tickets View */}
        {view === 'tickets' && (
          <TicketList
            tickets={tickets}
            loading={loading}
            error={error}
            hasMore={hasMore}
            filters={filters}
            onFilterChange={handleFilterChange}
            onLoadMore={actions.loadMore}
            onRefresh={actions.refresh}
            onTicketClick={handleTicketClick}
            showFilters={true}
            emptyMessage="No support tickets found"
            currentUser={user}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default InstructorSupportPage;
