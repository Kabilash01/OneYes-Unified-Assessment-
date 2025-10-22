import { useState, useEffect, useCallback } from 'react';
import supportService from '../services/supportService';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for managing support tickets
 * Handles ticket CRUD operations, filtering, and statistics
 */
export const useSupport = (options = {}) => {
  const {
    autoFetch = true,
    fetchInterval = null, // Auto-refresh interval in ms (null = no auto-refresh)
    role = 'student' // 'student' | 'instructor' | 'admin'
  } = options;

  // State management
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
    bySubject: {}
  });
  const [filters, setFilters] = useState({
    status: '',
    subject: '',
    priority: '',
    search: '',
    assignedTo: '', // For admin/instructor
    page: 1,
    limit: 20
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Fetch tickets based on role and filters
   */
  const fetchTickets = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);

      const queryFilters = resetPage ? { ...filters, page: 1 } : filters;
      
      let response;
      if (role === 'student') {
        response = await supportService.getMyTickets(queryFilters);
      } else {
        response = await supportService.getAllTickets(queryFilters);
      }

      if (resetPage) {
        setTickets(response.tickets);
        setFilters(prev => ({ ...prev, page: 1 }));
      } else {
        setTickets(prev => 
          filters.page === 1 
            ? response.tickets 
            : [...prev, ...response.tickets]
        );
      }

      setHasMore(response.tickets.length === filters.limit);
      
      if (response.stats) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.response?.data?.message || 'Failed to fetch tickets');
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [filters, role]);

  /**
   * Fetch ticket statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await supportService.getTicketStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  /**
   * Create a new support ticket
   */
  const createTicket = useCallback(async (ticketData) => {
    try {
      setLoading(true);
      const newTicket = await supportService.createTicket(ticketData);
      
      // Add to local state
      setTickets(prev => [newTicket, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        open: prev.open + 1,
        byPriority: {
          ...prev.byPriority,
          [newTicket.priority]: prev.byPriority[newTicket.priority] + 1
        }
      }));

      toast.success('Support ticket created successfully');
      return newTicket;
    } catch (err) {
      console.error('Error creating ticket:', err);
      const errorMsg = err.response?.data?.message || 'Failed to create ticket';
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update ticket status
   */
  const updateTicketStatus = useCallback(async (ticketId, status, resolution = '') => {
    try {
      setLoading(true);
      const updatedTicket = await supportService.updateTicketStatus(ticketId, status, resolution);
      
      // Update local state
      setTickets(prev => 
        prev.map(ticket => 
          ticket._id === ticketId ? updatedTicket : ticket
        )
      );

      // Refresh stats
      await fetchStats();

      toast.success(`Ticket marked as ${status}`);
      return updatedTicket;
    } catch (err) {
      console.error('Error updating ticket status:', err);
      toast.error('Failed to update ticket status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  /**
   * Assign ticket to instructor/admin
   */
  const assignTicket = useCallback(async (ticketId, assignedTo) => {
    try {
      setLoading(true);
      const updatedTicket = await supportService.assignTicket(ticketId, assignedTo);
      
      // Update local state
      setTickets(prev => 
        prev.map(ticket => 
          ticket._id === ticketId ? updatedTicket : ticket
        )
      );

      toast.success('Ticket assigned successfully');
      return updatedTicket;
    } catch (err) {
      console.error('Error assigning ticket:', err);
      toast.error('Failed to assign ticket');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Close a ticket
   */
  const closeTicket = useCallback(async (ticketId, resolution) => {
    try {
      setLoading(true);
      const updatedTicket = await supportService.closeTicket(ticketId, resolution);
      
      // Update local state
      setTickets(prev => 
        prev.map(ticket => 
          ticket._id === ticketId ? updatedTicket : ticket
        )
      );

      // Refresh stats
      await fetchStats();

      toast.success('Ticket closed successfully');
      return updatedTicket;
    } catch (err) {
      console.error('Error closing ticket:', err);
      toast.error('Failed to close ticket');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  /**
   * Upload file attachment to ticket
   */
  const uploadAttachment = useCallback(async (ticketId, file) => {
    try {
      setLoading(true);
      const updatedTicket = await supportService.uploadAttachment(ticketId, file);
      
      // Update local state
      setTickets(prev => 
        prev.map(ticket => 
          ticket._id === ticketId ? updatedTicket : ticket
        )
      );

      toast.success('File uploaded successfully');
      return updatedTicket;
    } catch (err) {
      console.error('Error uploading file:', err);
      toast.error('Failed to upload file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load more tickets (pagination)
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [loading, hasMore]);

  /**
   * Refresh tickets (reset to page 1)
   */
  const refresh = useCallback(() => {
    fetchTickets(true);
  }, [fetchTickets]);

  /**
   * Update filter and refresh
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      status: '',
      subject: '',
      priority: '',
      search: '',
      assignedTo: '',
      page: 1,
      limit: 20
    });
  }, []);

  // Auto-fetch on mount and filter changes
  useEffect(() => {
    if (autoFetch) {
      fetchTickets(filters.page === 1);
    }
  }, [filters, autoFetch]);

  // Auto-refresh interval
  useEffect(() => {
    if (fetchInterval && autoFetch) {
      const intervalId = setInterval(() => {
        fetchTickets(filters.page === 1);
      }, fetchInterval);

      return () => clearInterval(intervalId);
    }
  }, [fetchInterval, autoFetch, fetchTickets, filters.page]);

  // Computed values
  const openTickets = tickets.filter(t => t.status === 'open');
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved');
  const closedTickets = tickets.filter(t => t.status === 'closed');
  const urgentTickets = tickets.filter(t => t.priority === 'urgent');

  return {
    // Data
    tickets,
    stats,
    filters,
    
    // Computed
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    urgentTickets,
    
    // State
    loading,
    error,
    hasMore,
    
    // Actions
    actions: {
      fetchTickets,
      fetchStats,
      createTicket,
      updateTicketStatus,
      assignTicket,
      closeTicket,
      uploadAttachment,
      loadMore,
      refresh,
      updateFilters,
      clearFilters
    }
  };
};

export default useSupport;
