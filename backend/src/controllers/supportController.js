const SupportTicket = require('../models/SupportTicket');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');
const path = require('path');
const fs = require('fs').promises;

/**
 * Create a new support ticket
 * POST /api/support/tickets
 */
exports.createTicket = async (req, res) => {
  try {
    const { title, subject, message, priority } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Validate required fields
    if (!title || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, and message are required',
      });
    }

    // Create ticket
    const ticket = new SupportTicket({
      userId,
      title,
      subject,
      message,
      priority: priority || 'medium',
      email: user.email,
    });

    await ticket.save();

    // Create initial system message
    const systemMessage = new ChatMessage({
      ticket: ticket._id,
      sender: userId,
      message: message,
      messageType: 'system',
    });
    await systemMessage.save();

    // Increment message count
    await ticket.incrementMessageCount(userId);

    // Populate user info
    await ticket.populate('userId', 'firstName lastName email role');

    // Notify admins about new ticket
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        type: 'support_ticket',
        title: 'New Support Ticket',
        message: `New ticket from ${user.firstName} ${user.lastName}: ${title}`,
        link: `/admin/support/${ticket._id}`,
      });
    }

    // Send email notification to admins
    try {
      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: `New Support Ticket - ${ticket.ticketNumber}`,
          template: 'newTicket',
          context: {
            adminName: admin.firstName,
            ticketNumber: ticket.ticketNumber,
            userName: `${user.firstName} ${user.lastName}`,
            userEmail: user.email,
            title: title,
            subject: subject,
            message: message,
            priority: priority,
            platformUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
            ticketId: ticket._id,
          },
        });
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket,
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: error.message,
    });
  }
};

/**
 * Get tickets created by current user
 * GET /api/support/tickets
 */
exports.getMyTickets = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, subject, priority, search } = req.query;

    // Build query
    const query = { userId };

    if (status) query.status = status;
    if (subject) query.subject = subject;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const tickets = await SupportTicket.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('lastMessageBy', 'firstName lastName')
      .sort({ updatedAt: -1 });

    // Get unread count for each ticket
    const ticketsWithUnread = await Promise.all(
      tickets.map(async (ticket) => {
        const unreadCount = await ChatMessage.getUnreadCount(ticket._id, userId);
        return {
          ...ticket.toObject(),
          unreadCount,
        };
      })
    );

    res.json({
      success: true,
      count: tickets.length,
      tickets: ticketsWithUnread,
    });
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message,
    });
  }
};

/**
 * Get all tickets (Admin/Instructor only)
 * GET /api/support/tickets/all
 */
exports.getAllTickets = async (req, res) => {
  try {
    const { status, subject, priority, assignedTo, search } = req.query;
    const currentUserId = req.user._id;
    const userRole = req.user.role;

    // Build query
    const query = {};

    // If instructor, only show tickets assigned to them or unassigned
    if (userRole === 'instructor') {
      query.$or = [
        { assignedTo: currentUserId },
        { assignedTo: null },
      ];
    }

    if (status) query.status = status;
    if (subject) query.subject = subject;
    if (priority) query.priority = priority;
    if (assignedTo === 'me') {
      query.assignedTo = currentUserId;
    } else if (assignedTo === 'unassigned') {
      query.assignedTo = null;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const tickets = await SupportTicket.find(query)
      .populate('userId', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('lastMessageBy', 'firstName lastName')
      .sort({ priority: -1, updatedAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message,
    });
  }
};

/**
 * Get ticket by ID with messages
 * GET /api/support/tickets/:id
 */
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const ticket = await SupportTicket.findById(id)
      .populate('userId', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email role')
      .populate('lastMessageBy', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Check access permission
    const isOwner = ticket.userId._id.toString() === userId.toString();
    const isAssigned = ticket.assignedTo && ticket.assignedTo._id.toString() === userId.toString();
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Get messages
    const messages = await ChatMessage.find({ 
      ticket: id,
      isDeleted: false,
    })
      .populate('sender', 'firstName lastName email role')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await ChatMessage.markAllAsRead(id, userId);

    res.json({
      success: true,
      ticket,
      messages,
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket',
      error: error.message,
    });
  }
};

/**
 * Update ticket status
 * PATCH /api/support/tickets/:id/status
 */
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;
    const userId = req.user._id;

    const ticket = await SupportTicket.findById(id)
      .populate('userId', 'firstName lastName email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    const oldStatus = ticket.status;
    ticket.status = status;

    if (status === 'resolved') {
      await ticket.markAsResolved(resolution);
    } else if (status === 'closed') {
      await ticket.closeTicket(resolution);
    } else {
      await ticket.save();
    }

    // Create system message
    const systemMessage = new ChatMessage({
      ticket: ticket._id,
      sender: userId,
      message: `Ticket status changed from "${oldStatus}" to "${status}"${resolution ? `: ${resolution}` : ''}`,
      messageType: 'system',
    });
    await systemMessage.save();

    // Notify ticket creator
    await createNotification({
      userId: ticket.userId._id,
      type: 'support_update',
      title: 'Ticket Status Updated',
      message: `Your ticket "${ticket.title}" status changed to: ${status}`,
      link: `/student/support/${ticket._id}`,
    });

    // Send email
    try {
      await sendEmail({
        to: ticket.userId.email,
        subject: `Ticket ${ticket.ticketNumber} - Status Update`,
        template: 'ticketStatusChanged',
        context: {
          userName: `${ticket.userId.firstName} ${ticket.userId.lastName}`,
          ticketNumber: ticket.ticketNumber,
          title: ticket.title,
          oldStatus,
          newStatus: status,
          resolution: resolution || '',
          platformUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
          ticketId: ticket._id,
        },
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    await ticket.populate('assignedTo', 'firstName lastName email role');

    res.json({
      success: true,
      message: 'Ticket status updated successfully',
      ticket,
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      error: error.message,
    });
  }
};

/**
 * Assign ticket to instructor/admin
 * PATCH /api/support/tickets/:id/assign
 */
exports.assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const currentUser = req.user;

    const ticket = await SupportTicket.findById(id)
      .populate('userId', 'firstName lastName email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Verify assignee exists and has appropriate role
    const assignee = await User.findById(assignedTo);
    if (!assignee || (assignee.role !== 'admin' && assignee.role !== 'instructor')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignee',
      });
    }

    ticket.assignedTo = assignedTo;
    await ticket.save();

    // Create system message
    const systemMessage = new ChatMessage({
      ticket: ticket._id,
      sender: currentUser._id,
      message: `Ticket assigned to ${assignee.firstName} ${assignee.lastName}`,
      messageType: 'system',
    });
    await systemMessage.save();

    // Notify assignee
    await createNotification({
      userId: assignedTo,
      type: 'support_assigned',
      title: 'New Ticket Assigned',
      message: `You've been assigned ticket: ${ticket.title}`,
      link: `/instructor/support/${ticket._id}`,
    });

    // Send email to assignee
    try {
      await sendEmail({
        to: assignee.email,
        subject: `Ticket Assigned - ${ticket.ticketNumber}`,
        template: 'ticketAssigned',
        context: {
          assigneeName: `${assignee.firstName} ${assignee.lastName}`,
          ticketNumber: ticket.ticketNumber,
          title: ticket.title,
          userName: `${ticket.userId.firstName} ${ticket.userId.lastName}`,
          subject: ticket.subject,
          priority: ticket.priority,
          platformUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
          ticketId: ticket._id,
        },
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    await ticket.populate('assignedTo', 'firstName lastName email role');

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
      ticket,
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign ticket',
      error: error.message,
    });
  }
};

/**
 * Close ticket
 * POST /api/support/tickets/:id/close
 */
exports.closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    const userId = req.user._id;

    const ticket = await SupportTicket.findById(id)
      .populate('userId', 'firstName lastName email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    await ticket.closeTicket(resolution);

    // Create system message
    const systemMessage = new ChatMessage({
      ticket: ticket._id,
      sender: userId,
      message: `Ticket closed${resolution ? `: ${resolution}` : ''}`,
      messageType: 'system',
    });
    await systemMessage.save();

    // Notify ticket creator
    await createNotification({
      userId: ticket.userId._id,
      type: 'support_closed',
      title: 'Ticket Closed',
      message: `Your ticket "${ticket.title}" has been closed`,
      link: `/student/support/${ticket._id}`,
    });

    res.json({
      success: true,
      message: 'Ticket closed successfully',
      ticket,
    });
  } catch (error) {
    console.error('Close ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close ticket',
      error: error.message,
    });
  }
};

/**
 * Get ticket statistics (Admin/Instructor)
 * GET /api/support/stats
 */
exports.getTicketStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    let query = {};
    
    // Instructors only see their assigned tickets
    if (userRole === 'instructor') {
      query.assignedTo = userId;
    }

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      unassignedTickets,
      highPriorityTickets,
      urgentTickets,
    ] = await Promise.all([
      SupportTicket.countDocuments(query),
      SupportTicket.countDocuments({ ...query, status: 'open' }),
      SupportTicket.countDocuments({ ...query, status: 'in-progress' }),
      SupportTicket.countDocuments({ ...query, status: 'resolved' }),
      SupportTicket.countDocuments({ ...query, status: 'closed' }),
      SupportTicket.countDocuments({ ...query, assignedTo: null }),
      SupportTicket.countDocuments({ ...query, priority: 'high' }),
      SupportTicket.countDocuments({ ...query, priority: 'urgent' }),
    ]);

    // Get tickets by category
    const ticketsByCategory = await SupportTicket.aggregate([
      { $match: query },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
    ]);

    // Get recent tickets
    const recentTickets = await SupportTicket.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        unassigned: unassignedTickets,
        highPriority: highPriorityTickets,
        urgent: urgentTickets,
        byCategory: ticketsByCategory,
      },
      recentTickets,
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket statistics',
      error: error.message,
    });
  }
};

/**
 * Upload attachment to ticket
 * POST /api/support/tickets/:id/upload
 */
exports.uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
    };

    ticket.attachments.push(attachment);
    await ticket.save();

    res.json({
      success: true,
      message: 'File uploaded successfully',
      attachment,
    });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message,
    });
  }
};
