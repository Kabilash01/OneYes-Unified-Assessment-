import api from './api';

/**
 * Support Service
 * Handles all support ticket API calls
 */

/**
 * Create a new support ticket
 */
export const createTicket = async (ticketData) => {
  try {
    const response = await api.post('/support/tickets', ticketData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get tickets created by current user
 */
export const getMyTickets = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/support/tickets?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all tickets (Admin/Instructor only)
 */
export const getAllTickets = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/support/tickets/all?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get ticket by ID with messages
 */
export const getTicketById = async (ticketId) => {
  try {
    const response = await api.get(`/support/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update ticket status
 */
export const updateTicketStatus = async (ticketId, status, resolution = '') => {
  try {
    const response = await api.patch(`/support/tickets/${ticketId}/status`, {
      status,
      resolution,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Assign ticket to instructor/admin
 */
export const assignTicket = async (ticketId, assignedTo) => {
  try {
    const response = await api.patch(`/support/tickets/${ticketId}/assign`, {
      assignedTo,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Close ticket
 */
export const closeTicket = async (ticketId, resolution = '') => {
  try {
    const response = await api.post(`/support/tickets/${ticketId}/close`, {
      resolution,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Upload attachment to ticket
 */
export const uploadAttachment = async (ticketId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/support/tickets/${ticketId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get ticket statistics (Admin/Instructor)
 */
export const getTicketStats = async () => {
  try {
    const response = await api.get('/support/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Send a message in a ticket
 */
export const sendMessage = async (ticketId, message, attachment = null) => {
  try {
    const formData = new FormData();
    formData.append('ticketId', ticketId);
    formData.append('message', message);
    
    if (attachment) {
      formData.append('attachment', attachment);
    }
    
    const response = await api.post('/chat/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get messages for a ticket
 */
export const getMessages = async (ticketId, limit = 50, before = null) => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit);
    if (before) params.append('before', before);
    
    const response = await api.get(`/chat/messages/${ticketId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await api.patch(`/chat/messages/${messageId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Mark all messages in ticket as read
 */
export const markAllMessagesAsRead = async (ticketId) => {
  try {
    const response = await api.patch(`/chat/tickets/${ticketId}/read-all`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Edit a message
 */
export const editMessage = async (messageId, newMessage) => {
  try {
    const response = await api.patch(`/chat/messages/${messageId}`, {
      message: newMessage,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId) => {
  try {
    const response = await api.delete(`/chat/messages/${messageId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get('/chat/unread-count');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  closeTicket,
  uploadAttachment,
  getTicketStats,
  sendMessage,
  getMessages,
  markMessageAsRead,
  markAllMessagesAsRead,
  editMessage,
  deleteMessage,
  getUnreadCount,
};
