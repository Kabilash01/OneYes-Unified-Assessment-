import React, { useState, useEffect } from 'react';
import TicketCard from './TicketCard';
import TicketFilters from './TicketFilters';
import { Loader2, AlertCircle, RefreshCw, Plus, Inbox } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

/**
 * TicketList Component
 * Displays a filterable, paginated list of support tickets
 * 
 * Props:
 * - tickets: Array of ticket objects
 * - loading: Loading state
 * - error: Error message
 * - hasMore: Whether more tickets are available
 * - filters: Current filter values
 * - onFilterChange: Callback when filters change
 * - onLoadMore: Callback to load more tickets
 * - onRefresh: Callback to refresh list
 * - onCreateTicket: Callback to create new ticket
 * - onTicketClick: Callback when ticket is clicked
 * - showFilters: Whether to show filter controls
 * - emptyMessage: Custom empty state message
 * - currentUser: Logged in user object
 */
const TicketList = ({
  tickets = [],
  loading = false,
  error = null,
  hasMore = false,
  filters = {},
  onFilterChange,
  onLoadMore,
  onRefresh,
  onCreateTicket,
  onTicketClick,
  showFilters = true,
  emptyMessage = 'No tickets found',
  currentUser
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  /**
   * Auto-load more when scrolled to bottom
   */
  useEffect(() => {
    if (inView && hasMore && !loading) {
      onLoadMore?.();
    }
  }, [inView, hasMore, loading, onLoadMore]);

  /**
   * Get ticket status counts
   */
  const getStatusCounts = () => {
    return {
      all: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in-progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    };
  };

  const counts = getStatusCounts();

  /**
   * Error state
   */
  if (error && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load tickets
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
          <p className="text-gray-600 mt-1">
            {counts.all} {counts.all === 1 ? 'ticket' : 'tickets'} total
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* View mode toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>

          {/* Create ticket button */}
          {onCreateTicket && (
            <button
              onClick={onCreateTicket}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-2">
        {[
          { label: 'All', value: '', count: counts.all },
          { label: 'Open', value: 'open', count: counts.open },
          { label: 'In Progress', value: 'in-progress', count: counts.inProgress },
          { label: 'Resolved', value: 'resolved', count: counts.resolved },
          { label: 'Closed', value: 'closed', count: counts.closed }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => onFilterChange?.({ ...filters, status: tab.value })}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              filters.status === tab.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              filters.status === tab.value
                ? 'bg-indigo-700'
                : 'bg-gray-200'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <TicketFilters
          filters={filters}
          onFilterChange={onFilterChange}
          currentUser={currentUser}
        />
      )}

      {/* Loading state (initial) */}
      {loading && tickets.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading tickets...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && tickets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <Inbox className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.status || filters.search || filters.priority
              ? 'Try adjusting your filters'
              : 'Create your first support ticket to get started'}
          </p>
          {onCreateTicket && !filters.status && !filters.search && (
            <button
              onClick={onCreateTicket}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Ticket</span>
            </button>
          )}
        </div>
      )}

      {/* Ticket grid/list */}
      {tickets.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              onClick={() => onTicketClick?.(ticket)}
              viewMode={viewMode}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-8 text-center">
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="text-gray-600">Loading more tickets...</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Load More
            </button>
          )}
        </div>
      )}

      {/* End of list message */}
      {!hasMore && tickets.length > 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          You've reached the end of the list
        </div>
      )}
    </div>
  );
};

export default TicketList;
