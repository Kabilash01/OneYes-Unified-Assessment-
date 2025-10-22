import { useState, useEffect, useCallback, useRef } from 'react';
import supportService from '../services/supportService';
import socketService from '../services/socketService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for managing real-time chat functionality
 * Handles messages, Socket.io events, typing indicators, and read receipts
 */
export const useChat = (ticketId, options = {}) => {
  const {
    autoConnect = true,
    autoJoin = true,
    messageLimit = 50,
    typingTimeout = 3000 // ms before typing indicator disappears
  } = options;

  const { user } = useAuth();
  
  // State management
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map()); // userId -> timeout
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeUsers, setActiveUsers] = useState(new Set());

  // Refs for cleanup and typing management
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  /**
   * Connect to Socket.io server
   */
  const connect = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await socketService.connect(token);
      setConnected(true);
      toast.success('Connected to real-time chat');
    } catch (err) {
      console.error('Socket connection error:', err);
      setError('Failed to connect to chat');
      toast.error('Failed to connect to real-time chat');
    }
  }, []);

  /**
   * Disconnect from Socket.io server
   */
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setConnected(false);
    setJoined(false);
  }, []);

  /**
   * Join ticket room
   */
  const joinTicket = useCallback(() => {
    if (ticketId && connected) {
      socketService.joinTicket(ticketId);
      setJoined(true);
    }
  }, [ticketId, connected]);

  /**
   * Leave ticket room
   */
  const leaveTicket = useCallback(() => {
    if (ticketId && joined) {
      socketService.leaveTicket(ticketId);
      setJoined(false);
    }
  }, [ticketId, joined]);

  /**
   * Fetch messages from server
   */
  const fetchMessages = useCallback(async (before = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await supportService.getMessages(ticketId, messageLimit, before);
      
      if (before) {
        // Prepend older messages
        setMessages(prev => [...response.messages, ...prev]);
      } else {
        // Initial load
        setMessages(response.messages);
      }

      setHasMore(response.messages.length === messageLimit);
      setUnreadCount(response.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [ticketId, messageLimit]);

  /**
   * Send a new message
   */
  const sendMessage = useCallback(async (messageContent, attachment = null, messageType = 'text') => {
    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        _id: tempId,
        ticket: ticketId,
        sender: user,
        message: messageContent,
        messageType,
        createdAt: new Date().toISOString(),
        isRead: false,
        readBy: [],
        sending: true
      };

      setMessages(prev => [...prev, optimisticMessage]);

      // Send via Socket.io for real-time
      if (connected && joined) {
        socketService.sendMessage(ticketId, messageContent, messageType);
      }

      // Also send via HTTP for persistence
      const savedMessage = await supportService.sendMessage(ticketId, messageContent, attachment);
      
      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempId ? savedMessage : msg
        )
      );

      // Stop typing indicator
      if (isTyping) {
        socketService.stopTyping(ticketId);
        setIsTyping(false);
      }

      // Scroll to bottom
      scrollToBottom();

      return savedMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.sending));
      throw err;
    }
  }, [ticketId, user, connected, joined, isTyping]);

  /**
   * Edit a message
   */
  const editMessage = useCallback(async (messageId, newContent) => {
    try {
      const updatedMessage = await supportService.editMessage(messageId, newContent);
      
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? updatedMessage : msg
        )
      );

      toast.success('Message updated');
      return updatedMessage;
    } catch (err) {
      console.error('Error editing message:', err);
      toast.error('Failed to edit message');
      throw err;
    }
  }, []);

  /**
   * Delete a message
   */
  const deleteMessage = useCallback(async (messageId) => {
    try {
      await supportService.deleteMessage(messageId);
      
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, isDeleted: true, message: 'This message has been deleted' }
            : msg
        )
      );

      toast.success('Message deleted');
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message');
      throw err;
    }
  }, []);

  /**
   * Mark message as read
   */
  const markAsRead = useCallback(async (messageId) => {
    try {
      await supportService.markMessageAsRead(messageId);
      
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, isRead: true, readBy: [...msg.readBy, { user: user._id, readAt: new Date() }] }
            : msg
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, [user]);

  /**
   * Mark all messages as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await supportService.markAllMessagesAsRead(ticketId);
      
      setMessages(prev => 
        prev.map(msg => ({ ...msg, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [ticketId]);

  /**
   * Start typing indicator
   */
  const startTyping = useCallback(() => {
    if (connected && joined && !isTyping) {
      socketService.startTyping(ticketId);
      setIsTyping(true);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (connected && joined) {
        socketService.stopTyping(ticketId);
        setIsTyping(false);
      }
    }, typingTimeout);
  }, [ticketId, connected, joined, isTyping, typingTimeout]);

  /**
   * Stop typing indicator
   */
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (connected && joined && isTyping) {
      socketService.stopTyping(ticketId);
      setIsTyping(false);
    }
  }, [ticketId, connected, joined, isTyping]);

  /**
   * Load older messages
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore && messages.length > 0) {
      const oldestMessage = messages[0];
      fetchMessages(oldestMessage._id);
    }
  }, [loading, hasMore, messages, fetchMessages]);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /**
   * Refresh messages
   */
  const refresh = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Socket event handlers
  useEffect(() => {
    if (!connected || !joined) return;

    // New message received
    const handleNewMessage = (message) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });

      // Auto-scroll if near bottom
      if (messagesEndRef.current) {
        const container = messagesEndRef.current.parentElement;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        
        if (isNearBottom) {
          scrollToBottom();
        }
      }

      // Mark as read if not own message
      if (message.sender._id !== user._id) {
        setTimeout(() => markAsRead(message._id), 1000);
      }
    };

    // Message read by someone
    const handleMessageRead = ({ messageId, userId }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, readBy: [...msg.readBy, { user: userId, readAt: new Date() }] }
            : msg
        )
      );
    };

    // User typing
    const handleUserTyping = ({ userId, userName, isTyping: typing }) => {
      if (userId === user._id) return;

      setTypingUsers(prev => {
        const newMap = new Map(prev);
        
        if (typing) {
          newMap.set(userId, userName);
        } else {
          newMap.delete(userId);
        }
        
        return newMap;
      });
    };

    // User joined/left
    const handleUserJoined = ({ userId, userName }) => {
      setActiveUsers(prev => new Set(prev).add(userId));
      toast(`${userName} joined the conversation`, { icon: '👋' });
    };

    const handleUserLeft = ({ userId, userName }) => {
      setActiveUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    // Ticket updated
    const handleTicketUpdated = (updatedTicket) => {
      // You can emit this to parent component if needed
      console.log('Ticket updated:', updatedTicket);
    };

    // Error handling
    const handleError = (error) => {
      console.error('Socket error:', error);
      toast.error('Connection error');
    };

    // Attach listeners
    socketService.onNewMessage(handleNewMessage);
    socketService.onMessageRead(handleMessageRead);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserJoined(handleUserJoined);
    socketService.onUserLeft(handleUserLeft);
    socketService.onTicketUpdated(handleTicketUpdated);
    socketService.onError(handleError);

    // Cleanup
    return () => {
      socketService.offNewMessage(handleNewMessage);
      socketService.offMessageRead(handleMessageRead);
      socketService.offUserTyping(handleUserTyping);
      socketService.offUserJoined(handleUserJoined);
      socketService.offUserLeft(handleUserLeft);
      socketService.offTicketUpdated(handleTicketUpdated);
      socketService.offError(handleError);
    };
  }, [connected, joined, user, markAsRead, scrollToBottom]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && !connected) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]);

  // Auto-join ticket when connected
  useEffect(() => {
    if (autoJoin && connected && ticketId && !joined) {
      joinTicket();
    }

    return () => {
      if (joined) {
        leaveTicket();
      }
    };
  }, [autoJoin, connected, ticketId, joined]);

  // Fetch messages when joined
  useEffect(() => {
    if (joined && ticketId) {
      fetchMessages();
    }
  }, [joined, ticketId]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data
    messages,
    unreadCount,
    typingUsers,
    activeUsers,
    
    // State
    loading,
    error,
    connected,
    joined,
    isTyping,
    hasMore,
    
    // Refs
    messagesEndRef,
    
    // Actions
    actions: {
      sendMessage,
      editMessage,
      deleteMessage,
      markAsRead,
      markAllAsRead,
      startTyping,
      stopTyping,
      loadMore,
      refresh,
      scrollToBottom
    },
    
    // Socket actions
    socketActions: {
      connect,
      disconnect,
      joinTicket,
      leaveTicket
    }
  };
};

export default useChat;
