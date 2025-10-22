const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SupportTicket = require('../models/SupportTicket');
const ChatMessage = require('../models/ChatMessage');

// Store active users and their socket connections
const activeUsers = new Map(); // userId -> Set of socket IDs
const userSockets = new Map(); // socketId -> userId
const ticketRooms = new Map(); // ticketId -> Set of user IDs

/**
 * Socket authentication middleware
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Invalid token'));
  }
};

/**
 * Check if user has access to a ticket
 */
const checkTicketAccess = async (userId, ticketId, userRole) => {
  try {
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      return false;
    }

    const isOwner = ticket.userId.toString() === userId.toString();
    const isAssigned = ticket.assignedTo && ticket.assignedTo.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    return isOwner || isAssigned || isAdmin;
  } catch (error) {
    console.error('Check ticket access error:', error);
    return false;
  }
};

/**
 * Initialize Socket.io event handlers
 */
const initializeSocketHandlers = (io) => {
  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    const userName = `${socket.user.firstName} ${socket.user.lastName}`;

    console.log(`✅ Socket connected: ${socket.id} (User: ${userName})`);

    // Track active user
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }
    activeUsers.get(userId).add(socket.id);
    userSockets.set(socket.id, userId);

    // Emit user online status
    socket.broadcast.emit('user-online', {
      userId,
      userName,
    });

    /**
     * Join a ticket room
     */
    socket.on('join-ticket', async (data) => {
      try {
        const { ticketId } = data;

        // Check access permission
        const hasAccess = await checkTicketAccess(userId, ticketId, socket.user.role);

        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied to this ticket' });
          return;
        }

        // Join socket room
        socket.join(`ticket-${ticketId}`);

        // Track user in ticket room
        if (!ticketRooms.has(ticketId)) {
          ticketRooms.set(ticketId, new Set());
        }
        ticketRooms.get(ticketId).add(userId);

        console.log(`👤 User ${userName} joined ticket ${ticketId}`);

        // Notify other users in the room
        socket.to(`ticket-${ticketId}`).emit('user-joined', {
          userId,
          userName,
          ticketId,
          timestamp: new Date(),
        });

        // Send confirmation to user
        socket.emit('joined-ticket', {
          ticketId,
          message: 'Successfully joined ticket',
        });
      } catch (error) {
        console.error('Join ticket error:', error);
        socket.emit('error', { message: 'Failed to join ticket' });
      }
    });

    /**
     * Leave a ticket room
     */
    socket.on('leave-ticket', (data) => {
      try {
        const { ticketId } = data;

        socket.leave(`ticket-${ticketId}`);

        // Remove user from ticket room tracking
        if (ticketRooms.has(ticketId)) {
          ticketRooms.get(ticketId).delete(userId);
          if (ticketRooms.get(ticketId).size === 0) {
            ticketRooms.delete(ticketId);
          }
        }

        console.log(`👋 User ${userName} left ticket ${ticketId}`);

        // Notify other users
        socket.to(`ticket-${ticketId}`).emit('user-left', {
          userId,
          userName,
          ticketId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Leave ticket error:', error);
      }
    });

    /**
     * Send a message in real-time
     */
    socket.on('send-message', async (data) => {
      try {
        const { ticketId, message, messageType = 'text' } = data;

        // Check access
        const hasAccess = await checkTicketAccess(userId, ticketId, socket.user.role);
        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Create message in database
        const chatMessage = new ChatMessage({
          ticket: ticketId,
          sender: userId,
          message,
          messageType,
        });

        await chatMessage.save();
        await chatMessage.populate('sender', 'firstName lastName email role');

        // Update ticket
        const ticket = await SupportTicket.findById(ticketId);
        if (ticket) {
          await ticket.incrementMessageCount(userId);
        }

        // Broadcast to all users in the ticket room
        io.to(`ticket-${ticketId}`).emit('new-message', {
          message: chatMessage,
          ticketId,
        });

        console.log(`💬 Message sent in ticket ${ticketId} by ${userName}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * User started typing
     */
    socket.on('typing-start', (data) => {
      const { ticketId } = data;

      socket.to(`ticket-${ticketId}`).emit('user-typing', {
        userId,
        userName,
        ticketId,
        isTyping: true,
      });
    });

    /**
     * User stopped typing
     */
    socket.on('typing-stop', (data) => {
      const { ticketId } = data;

      socket.to(`ticket-${ticketId}`).emit('user-typing', {
        userId,
        userName,
        ticketId,
        isTyping: false,
      });
    });

    /**
     * Mark message as read
     */
    socket.on('mark-read', async (data) => {
      try {
        const { messageId, ticketId } = data;

        const message = await ChatMessage.findById(messageId);
        if (message && message.sender.toString() !== userId) {
          await message.markAsReadBy(userId);

          // Notify sender that message was read
          io.to(`ticket-${ticketId}`).emit('message-read', {
            messageId,
            userId,
            userName,
            ticketId,
            readAt: new Date(),
          });
        }
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    /**
     * Ticket status updated
     */
    socket.on('ticket-status-updated', (data) => {
      const { ticketId, status, updatedBy } = data;

      io.to(`ticket-${ticketId}`).emit('ticket-updated', {
        ticketId,
        status,
        updatedBy,
        timestamp: new Date(),
      });
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id} (User: ${userName})`);

      // Remove from active users
      if (activeUsers.has(userId)) {
        activeUsers.get(userId).delete(socket.id);
        if (activeUsers.get(userId).size === 0) {
          activeUsers.delete(userId);

          // Emit user offline status
          socket.broadcast.emit('user-offline', {
            userId,
            userName,
          });
        }
      }

      userSockets.delete(socket.id);

      // Remove from ticket rooms
      ticketRooms.forEach((users, ticketId) => {
        if (users.has(userId)) {
          users.delete(userId);
          socket.to(`ticket-${ticketId}`).emit('user-left', {
            userId,
            userName,
            ticketId,
            timestamp: new Date(),
          });
        }
      });
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('🔌 Socket.io event handlers initialized');
};

/**
 * Get active users count
 */
const getActiveUsersCount = () => {
  return activeUsers.size;
};

/**
 * Get users in a ticket room
 */
const getUsersInTicket = (ticketId) => {
  return ticketRooms.get(ticketId) || new Set();
};

/**
 * Emit event to specific user
 */
const emitToUser = (io, userId, event, data) => {
  const socketIds = activeUsers.get(userId.toString());
  if (socketIds) {
    socketIds.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
  }
};

/**
 * Emit event to ticket room
 */
const emitToTicket = (io, ticketId, event, data) => {
  io.to(`ticket-${ticketId}`).emit(event, data);
};

module.exports = {
  initializeSocketHandlers,
  getActiveUsersCount,
  getUsersInTicket,
  emitToUser,
  emitToTicket,
};
