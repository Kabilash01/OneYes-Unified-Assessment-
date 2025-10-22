const ChatMessage = require('../models/ChatMessage');
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const { sendEmail } = require('../services/emailService');

/**
 * Send a message in a ticket
 * POST /api/chat/messages
 */
exports.sendMessage = async (req, res) => {
  try {
    const { ticketId, message, messageType } = req.body;
    const senderId = req.user._id;
    const user = req.user;

    // Validate required fields
    if (!ticketId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID and message are required',
      });
    }

    // Find ticket
    const ticket = await SupportTicket.findById(ticketId)
      .populate('userId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Check access permission
    const isOwner = ticket.userId._id.toString() === senderId.toString();
    const isAssigned = ticket.assignedTo && ticket.assignedTo._id.toString() === senderId.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Create message
    const chatMessage = new ChatMessage({
      ticket: ticketId,
      sender: senderId,
      message,
      messageType: messageType || 'text',
    });

    // Handle file attachment if present
    if (req.file) {
      chatMessage.attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/attachments/${req.file.filename}`,
        path: req.file.path,
      };
      chatMessage.messageType = 'file';
    }

    await chatMessage.save();

    // Update ticket message count and last message info
    await ticket.incrementMessageCount(senderId);

    // Update ticket status if it's currently resolved or closed
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      ticket.status = 'in-progress';
      await ticket.save();
    }

    // Populate sender info
    await chatMessage.populate('sender', 'firstName lastName email role');

    // Determine who to notify (everyone except sender)
    const notifyUsers = [];
    
    if (ticket.userId._id.toString() !== senderId.toString()) {
      notifyUsers.push(ticket.userId);
    }
    
    if (ticket.assignedTo && ticket.assignedTo._id.toString() !== senderId.toString()) {
      notifyUsers.push(ticket.assignedTo);
    }

    // Send notifications and emails
    for (const notifyUser of notifyUsers) {
      // Create notification
      await createNotification({
        userId: notifyUser._id,
        type: 'support_message',
        title: 'New Message in Ticket',
        message: `${user.firstName} ${user.lastName} sent a message in ticket: ${ticket.title}`,
        link: notifyUser.role === 'student' 
          ? `/student/support/${ticket._id}` 
          : `/instructor/support/${ticket._id}`,
      });

      // Send email
      try {
        await sendEmail({
          to: notifyUser.email,
          subject: `New Message in Ticket ${ticket.ticketNumber}`,
          template: 'newMessage',
          context: {
            recipientName: `${notifyUser.firstName} ${notifyUser.lastName}`,
            senderName: `${user.firstName} ${user.lastName}`,
            ticketNumber: ticket.ticketNumber,
            title: ticket.title,
            message: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
            hasAttachment: !!req.file,
            platformUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
            ticketId: ticket._id,
          },
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      chatMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

/**
 * Get all messages for a ticket
 * GET /api/chat/messages/:ticketId
 */
exports.getMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    const { limit = 50, before } = req.query;

    // Find ticket
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Check access permission
    const isOwner = ticket.userId.toString() === userId.toString();
    const isAssigned = ticket.assignedTo && ticket.assignedTo.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Build query
    const query = {
      ticket: ticketId,
      isDeleted: false,
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Get messages
    const messages = await ChatMessage.find(query)
      .populate('sender', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Reverse to get chronological order
    messages.reverse();

    // Get unread count
    const unreadCount = await ChatMessage.getUnreadCount(ticketId, userId);

    res.json({
      success: true,
      count: messages.length,
      unreadCount,
      messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

/**
 * Mark message(s) as read
 * PATCH /api/chat/messages/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await ChatMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Don't mark own messages as read
    if (message.sender.toString() === userId.toString()) {
      return res.json({
        success: true,
        message: 'Cannot mark own message as read',
      });
    }

    await message.markAsReadBy(userId);

    res.json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message,
    });
  }
};

/**
 * Mark all messages in a ticket as read
 * PATCH /api/chat/tickets/:ticketId/read-all
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user._id;

    const count = await ChatMessage.markAllAsRead(ticketId, userId);

    res.json({
      success: true,
      message: `${count} messages marked as read`,
      count,
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message,
    });
  }
};

/**
 * Edit a message
 * PATCH /api/chat/messages/:id
 */
exports.editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message: newMessage } = req.body;
    const userId = req.user._id;

    if (!newMessage) {
      return res.status(400).json({
        success: false,
        message: 'New message content is required',
      });
    }

    const message = await ChatMessage.findById(id)
      .populate('sender', 'firstName lastName email role');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only sender can edit
    if (message.sender._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages',
      });
    }

    // Check if message is too old to edit (e.g., 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (message.createdAt < fiveMinutesAgo) {
      return res.status(400).json({
        success: false,
        message: 'Message is too old to edit (5 minute limit)',
      });
    }

    // Cannot edit system messages or file messages
    if (message.messageType !== 'text') {
      return res.status(400).json({
        success: false,
        message: 'Only text messages can be edited',
      });
    }

    await message.editMessage(newMessage);

    res.json({
      success: true,
      message: 'Message edited successfully',
      chatMessage: message,
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message',
      error: error.message,
    });
  }
};

/**
 * Delete a message
 * DELETE /api/chat/messages/:id
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const message = await ChatMessage.findById(id)
      .populate('sender', 'firstName lastName');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only sender or admin can delete
    const isSender = message.sender._id.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isSender && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      });
    }

    // Soft delete
    await message.softDelete();

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message,
    });
  }
};

/**
 * Get unread message count for a user
 * GET /api/chat/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all tickets user has access to
    const tickets = await SupportTicket.find({
      $or: [
        { userId: userId },
        { assignedTo: userId },
      ],
    });

    let totalUnread = 0;
    const ticketUnreadCounts = [];

    for (const ticket of tickets) {
      const unreadCount = await ChatMessage.getUnreadCount(ticket._id, userId);
      totalUnread += unreadCount;
      
      if (unreadCount > 0) {
        ticketUnreadCounts.push({
          ticketId: ticket._id,
          ticketNumber: ticket.ticketNumber,
          title: ticket.title,
          unreadCount,
        });
      }
    }

    res.json({
      success: true,
      totalUnread,
      tickets: ticketUnreadCounts,
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message,
    });
  }
};
