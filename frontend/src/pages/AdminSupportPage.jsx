import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupport } from '../hooks/useSupport';
import { useAuth } from '../context/AuthContext';
import TicketList from '../components/TicketList';
import SupportDashboard from '../components/SupportDashboard';
import supportService from '../services/supportService';
import Footer from '../components/Footer';
import { toast } from 'react-hot-toast';
import { LayoutDashboard, List, Download, Loader2 } from 'lucide-react';

/**
 * AdminSupportPage
 * Comprehensive support management page for administrators
 */
const AdminSupportPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'tickets'
  const [exporting, setExporting] = useState(false);

  const {
    tickets,
    stats,
    filters,
    loading,
    error,
    hasMore,
    actions
  } = useSupport({
    role: 'admin',
    autoFetch: true,
    fetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  /**
   * Handle ticket click
   */
  const handleTicketClick = (ticket) => {
    navigate(`/admin-dashboard/support/${ticket._id}`);
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (newFilters) => {
    actions.updateFilters(newFilters);
  };

  /**
   * Export tickets to CSV
   */
  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Fetch all tickets (without pagination)
      const allTickets = await supportService.getAllTickets({
        ...filters,
        limit: 10000 // Large limit to get all
      });

      // Convert to CSV
      const csvContent = convertToCSV(allTickets);
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `support-tickets-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Tickets exported successfully');
    } catch (err) {
      console.error('Failed to export tickets:', err);
      toast.error('Failed to export tickets');
    } finally {
      setExporting(false);
    }
  };

  /**
   * Convert tickets to CSV format
   */
  const convertToCSV = (tickets) => {
    const headers = [
      'Ticket Number',
      'Title',
      'Status',
      'Priority',
      'Subject',
      'Created By',
      'Assigned To',
      'Created At',
      'Updated At',
      'Messages',
      'Resolution'
    ];

    const rows = tickets.map(ticket => [
      ticket.ticketNumber,
      `"${ticket.title}"`,
      ticket.status,
      ticket.priority,
      ticket.subject,
      `"${ticket.createdBy.firstName} ${ticket.createdBy.lastName}"`,
      ticket.assignedTo ? `"${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}"` : 'Unassigned',
      new Date(ticket.createdAt).toLocaleString(),
      new Date(ticket.updatedAt).toLocaleString(),
      ticket.messageCount || 0,
      ticket.resolution ? `"${ticket.resolution}"` : ''
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Header with view toggle and actions */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitor and manage all support tickets
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exporting || loading}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Export CSV</span>
            </button>

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
                <span>All Tickets</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview (always visible) */}
        {view === 'tickets' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {/* Total Tickets */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.total || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Open Tickets */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {stats.open || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {stats.inProgress || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Resolved */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {stats.resolved || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Closed */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Closed</p>
                  <p className="text-2xl font-bold text-gray-600 mt-1">
                    {stats.closed || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Urgent */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {stats.urgent || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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

export default AdminSupportPage;
