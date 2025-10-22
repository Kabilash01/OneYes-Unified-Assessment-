import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  /**
   * Connect to Socket.io server
   */
  connect(token) {
    if (this.socket && this.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });

    return this.socket;
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('Socket disconnected manually');
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  /**
   * Join a ticket room
   */
  joinTicket(ticketId) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.emit('join-ticket', { ticketId });
    console.log(`Joining ticket room: ${ticketId}`);
  }

  /**
   * Leave a ticket room
   */
  leaveTicket(ticketId) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.emit('leave-ticket', { ticketId });
    console.log(`Leaving ticket room: ${ticketId}`);
  }

  /**
   * Send a message
   */
  sendMessage(ticketId, message, messageType = 'text') {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.emit('send-message', {
      ticketId,
      message,
      messageType,
    });
  }

  /**
   * Listen for new messages
   */
  onNewMessage(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('new-message', callback);
  }

  /**
   * Remove new message listener
   */
  offNewMessage(callback) {
    if (this.socket) {
      this.socket.off('new-message', callback);
    }
  }

  /**
   * Listen for message read events
   */
  onMessageRead(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('message-read', callback);
  }

  /**
   * Remove message read listener
   */
  offMessageRead(callback) {
    if (this.socket) {
      this.socket.off('message-read', callback);
    }
  }

  /**
   * Start typing indicator
   */
  startTyping(ticketId) {
    if (!this.socket) return;

    this.socket.emit('typing-start', { ticketId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(ticketId) {
    if (!this.socket) return;

    this.socket.emit('typing-stop', { ticketId });
  }

  /**
   * Listen for typing events
   */
  onUserTyping(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('user-typing', callback);
  }

  /**
   * Remove typing listener
   */
  offUserTyping(callback) {
    if (this.socket) {
      this.socket.off('user-typing', callback);
    }
  }

  /**
   * Mark message as read
   */
  markAsRead(messageId, ticketId) {
    if (!this.socket) return;

    this.socket.emit('mark-read', { messageId, ticketId });
  }

  /**
   * Listen for ticket updates
   */
  onTicketUpdated(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('ticket-updated', callback);
  }

  /**
   * Remove ticket updated listener
   */
  offTicketUpdated(callback) {
    if (this.socket) {
      this.socket.off('ticket-updated', callback);
    }
  }

  /**
   * Listen for user joined events
   */
  onUserJoined(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('user-joined', callback);
  }

  /**
   * Remove user joined listener
   */
  offUserJoined(callback) {
    if (this.socket) {
      this.socket.off('user-joined', callback);
    }
  }

  /**
   * Listen for user left events
   */
  onUserLeft(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('user-left', callback);
  }

  /**
   * Remove user left listener
   */
  offUserLeft(callback) {
    if (this.socket) {
      this.socket.off('user-left', callback);
    }
  }

  /**
   * Listen for joined ticket confirmation
   */
  onJoinedTicket(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('joined-ticket', callback);
  }

  /**
   * Remove joined ticket listener
   */
  offJoinedTicket(callback) {
    if (this.socket) {
      this.socket.off('joined-ticket', callback);
    }
  }

  /**
   * Listen for user online status
   */
  onUserOnline(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('user-online', callback);
  }

  /**
   * Remove user online listener
   */
  offUserOnline(callback) {
    if (this.socket) {
      this.socket.off('user-online', callback);
    }
  }

  /**
   * Listen for user offline status
   */
  onUserOffline(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('user-offline', callback);
  }

  /**
   * Remove user offline listener
   */
  offUserOffline(callback) {
    if (this.socket) {
      this.socket.off('user-offline', callback);
    }
  }

  /**
   * Listen for errors
   */
  onError(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('error', callback);
  }

  /**
   * Remove error listener
   */
  offError(callback) {
    if (this.socket) {
      this.socket.off('error', callback);
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
