/**
 * Calendar Controller
 * Handles calendar-related requests for all user roles
 */

const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');
const calendarService = require('../services/calendarService');
const { createNotification } = require('../services/notificationService');
const { sendEmail } = require('../config/email');

/**
 * Get student calendar
 * Shows all assessments assigned to the student
 */
const getStudentCalendar = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { start, end, view = 'month' } = req.query;

    // Verify user has permission
    if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Get date range
    const dateRange = start && end
      ? { start: new Date(start), end: new Date(end) }
      : calendarService.getDateRangeForView(new Date(), view);

    // Fetch assessments with submission status
    const assessments = await Assessment.aggregate([
      {
        $match: {
          students: mongoose.Types.ObjectId(studentId),
          isPublished: true,
          status: 'active',
          deadline: {
            $gte: dateRange.start,
            $lte: dateRange.end,
          },
        },
      },
      {
        $lookup: {
          from: 'submissions',
          let: { assessmentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$assessmentId', '$$assessmentId'] },
                    { $eq: ['$studentId', mongoose.Types.ObjectId(studentId)] },
                  ],
                },
              },
            },
          ],
          as: 'submission',
        },
      },
      {
        $addFields: {
          submission: { $arrayElemAt: ['$submission', 0] },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'instructor',
        },
      },
      {
        $addFields: {
          instructor: { $arrayElemAt: ['$instructor', 0] },
          submissionStatus: {
            $cond: {
              if: { $gt: ['$submission', null] },
              then: '$submission.status',
              else: 'pending',
            },
          },
          score: {
            $cond: {
              if: { $gt: ['$submission', null] },
              then: '$submission.score',
              else: null,
            },
          },
        },
      },
      {
        $project: {
          title: 1,
          subject: 1,
          description: 1,
          duration: 1,
          totalMarks: 1,
          deadline: 1,
          startDate: 1,
          priority: 1,
          status: 1,
          submissionStatus: 1,
          score: 1,
          'instructor.name': 1,
          'instructor.email': 1,
        },
      },
      { $sort: { deadline: 1 } },
    ]);

    // Format events for calendar
    const events = assessments.map((assessment) =>
      calendarService.formatEventForCalendar(assessment, 'assessment')
    );

    // Calculate summary
    const summary = {
      total: events.length,
      pending: events.filter((e) => e.status === 'pending').length,
      submitted: events.filter((e) => e.status === 'submitted').length,
      evaluated: events.filter((e) => e.status === 'evaluated').length,
      overdue: events.filter((e) => e.countdown.isOverdue && e.status === 'pending').length,
    };

    res.json({
      success: true,
      data: {
        events,
        summary,
        dateRange,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get instructor calendar
 * Shows all assessments created by the instructor with evaluation status
 */
const getInstructorCalendar = async (req, res, next) => {
  try {
    const { instructorId } = req.params;
    const { start, end, view = 'month' } = req.query;

    // Verify user has permission
    if (req.user.role !== 'admin' && req.user._id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Get date range
    const dateRange = start && end
      ? { start: new Date(start), end: new Date(end) }
      : calendarService.getDateRangeForView(new Date(), view);

    // Fetch assessments with submission statistics
    const assessments = await Assessment.aggregate([
      {
        $match: {
          createdBy: mongoose.Types.ObjectId(instructorId),
          $or: [
            {
              deadline: {
                $gte: dateRange.start,
                $lte: dateRange.end,
              },
            },
            {
              createdAt: {
                $gte: dateRange.start,
                $lte: dateRange.end,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'assessmentId',
          as: 'submissions',
        },
      },
      {
        $addFields: {
          totalSubmissions: { $size: '$submissions' },
          pendingEvaluations: {
            $size: {
              $filter: {
                input: '$submissions',
                cond: { $eq: ['$$this.status', 'submitted'] },
              },
            },
          },
          evaluatedCount: {
            $size: {
              $filter: {
                input: '$submissions',
                cond: { $eq: ['$$this.status', 'evaluated'] },
              },
            },
          },
        },
      },
      {
        $project: {
          title: 1,
          subject: 1,
          description: 1,
          duration: 1,
          totalMarks: 1,
          deadline: 1,
          publishedDate: 1,
          createdAt: 1,
          isPublished: 1,
          status: 1,
          totalSubmissions: 1,
          pendingEvaluations: 1,
          evaluatedCount: 1,
        },
      },
      { $sort: { deadline: 1 } },
    ]);

    // Format events for calendar
    const events = assessments.map((assessment) => ({
      id: assessment._id,
      type: 'assessment',
      title: assessment.title,
      subject: assessment.subject,
      deadline: assessment.deadline,
      publishedDate: assessment.publishedDate,
      createdAt: assessment.createdAt,
      totalSubmissions: assessment.totalSubmissions,
      pendingEvaluations: assessment.pendingEvaluations,
      evaluatedCount: assessment.evaluatedCount,
      color: assessment.pendingEvaluations > 0 ? '#F59E0B' : '#10B981',
      badge: assessment.pendingEvaluations > 0
        ? {
            count: assessment.pendingEvaluations,
            label: 'Pending',
            color: '#EF4444',
          }
        : null,
      countdown: calendarService.calculateCountdown(assessment.deadline),
    }));

    // Calculate summary
    const summary = {
      totalAssessments: events.length,
      pendingEvaluations: events.reduce((sum, e) => sum + e.pendingEvaluations, 0),
      completedEvaluations: events.reduce((sum, e) => sum + e.evaluatedCount, 0),
      publishedAssessments: events.filter((e) => assessments.find(a => a._id.toString() === e.id.toString())?.isPublished).length,
    };

    res.json({
      success: true,
      data: {
        events,
        summary,
        dateRange,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get admin calendar
 * Shows platform-wide activity including user registrations, assessments, etc.
 */
const getAdminCalendar = async (req, res, next) => {
  try {
    const { start, end, view = 'month', eventType = 'all' } = req.query;

    // Verify admin permission
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    // Get date range
    const dateRange = start && end
      ? { start: new Date(start), end: new Date(end) }
      : calendarService.getDateRangeForView(new Date(), view);

    const events = [];

    // Get user registrations
    if (eventType === 'all' || eventType === 'registrations') {
      const registrations = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            users: { $push: { name: '$name', email: '$email', role: '$role' } },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      registrations.forEach((reg) => {
        events.push({
          id: `reg_${reg._id}`,
          type: 'registration',
          date: reg._id,
          title: `${reg.count} New User${reg.count > 1 ? 's' : ''}`,
          count: reg.count,
          color: '#3B82F6',
          details: reg.users,
        });
      });
    }

    // Get assessment creations
    if (eventType === 'all' || eventType === 'assessments') {
      const assessmentCreations = await Assessment.aggregate([
        {
          $match: {
            createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            assessments: { $push: { title: '$title', subject: '$subject' } },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      assessmentCreations.forEach((ac) => {
        events.push({
          id: `assess_${ac._id}`,
          type: 'assessment_created',
          date: ac._id,
          title: `${ac.count} Assessment${ac.count > 1 ? 's' : ''} Created`,
          count: ac.count,
          color: '#10B981',
          details: ac.assessments,
        });
      });
    }

    // Get activity logs (high priority only)
    if (eventType === 'all' || eventType === 'activities') {
      const activities = await ActivityLog.aggregate([
        {
          $match: {
            timestamp: { $gte: dateRange.start, $lte: dateRange.end },
            $or: [
              { action: 'login_failed' },
              { action: 'user_suspended' },
              { action: 'user_deleted' },
              { action: 'assessment_deleted' },
            ],
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 },
            actions: { $push: { action: '$action', user: '$userId' } },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      activities.forEach((act) => {
        events.push({
          id: `activity_${act._id}`,
          type: 'activity',
          date: act._id,
          title: `${act.count} Important Event${act.count > 1 ? 's' : ''}`,
          count: act.count,
          color: '#EF4444',
          details: act.actions,
        });
      });
    }

    // Get announcements
    if (eventType === 'all' || eventType === 'announcements') {
      const announcements = await Announcement.find({
        publishDate: { $gte: dateRange.start, $lte: dateRange.end },
      })
        .select('title message priority publishDate')
        .sort({ publishDate: 1 })
        .lean();

      announcements.forEach((ann) => {
        events.push({
          id: ann._id,
          type: 'announcement',
          date: ann.publishDate,
          title: ann.title,
          message: ann.message,
          priority: ann.priority,
          color: calendarService.generateColorByPriority(ann.priority),
        });
      });
    }

    // Sort events by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate trends
    const totalUsers = await User.countDocuments();
    const usersInRange = await User.countDocuments({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
    });
    const totalAssessments = await Assessment.countDocuments();
    const assessmentsInRange = await Assessment.countDocuments({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
    });

    res.json({
      success: true,
      data: {
        events,
        dateRange,
        trends: {
          userGrowth: totalUsers > 0 ? ((usersInRange / totalUsers) * 100).toFixed(1) + '%' : '0%',
          assessmentGrowth: totalAssessments > 0 ? ((assessmentsInRange / totalAssessments) * 100).toFixed(1) + '%' : '0%',
          totalEventsInRange: events.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get events by date range
 * Flexible endpoint for custom queries
 */
const getEventsByDateRange = async (req, res, next) => {
  try {
    const { start, end, type = 'all', limit = 100 } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Start and end dates are required',
      });
    }

    const dateRange = {
      start: new Date(start),
      end: new Date(end),
    };

    let events = [];

    // Based on role, fetch appropriate events
    if (userRole === 'student') {
      const assessments = await Assessment.find({
        students: userId,
        deadline: { $gte: dateRange.start, $lte: dateRange.end },
      })
        .limit(parseInt(limit))
        .lean();

      events = assessments.map((a) => calendarService.formatEventForCalendar(a, 'assessment'));
    } else if (userRole === 'instructor') {
      const assessments = await Assessment.find({
        createdBy: userId,
        deadline: { $gte: dateRange.start, $lte: dateRange.end },
      })
        .limit(parseInt(limit))
        .lean();

      events = assessments.map((a) => calendarService.formatEventForCalendar(a, 'assessment'));
    } else if (userRole === 'admin') {
      // Return all event types
      const assessments = await Assessment.find({
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      })
        .limit(parseInt(limit))
        .lean();

      events = assessments.map((a) => calendarService.formatEventForCalendar(a, 'assessment'));
    }

    res.json({
      success: true,
      data: {
        events,
        count: events.length,
        dateRange,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update assessment date
 * Allows instructors to reschedule assessments
 */
const updateAssessmentDate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, notifyStudents = true, reason } = req.body;

    // Find assessment
    const assessment = await Assessment.findById(id).populate('students', 'name email');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
      });
    }

    // Check permission
    if (req.user.role !== 'admin' && assessment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const oldDate = assessment.deadline;
    assessment.deadline = new Date(newDate);
    await assessment.save();

    // Send notifications
    let notificationsSent = 0;
    if (notifyStudents && assessment.students.length > 0) {
      // Create notifications
      await createNotification({
        recipients: assessment.students.map((s) => s._id),
        type: 'assessment_rescheduled',
        title: 'Assessment Rescheduled',
        message: `"${assessment.title}" has been rescheduled to ${new Date(newDate).toLocaleString()}${reason ? `. Reason: ${reason}` : ''}`,
        priority: 'medium',
        link: `/student/assessments/${assessment._id}`,
        metadata: {
          assessmentId: assessment._id,
          oldDate,
          newDate,
          reason,
        },
      });

      // Send emails
      const emailPromises = assessment.students.map((student) =>
        sendEmail({
          to: student.email,
          subject: 'Assessment Date Updated',
          template: 'assessmentRescheduled',
          data: {
            studentName: student.name,
            assessmentTitle: assessment.title,
            oldDate: new Date(oldDate).toLocaleString(),
            newDate: new Date(newDate).toLocaleString(),
            reason: reason || 'Not specified',
          },
        }).catch(() => null) // Ignore email errors
      );

      await Promise.all(emailPromises);
      notificationsSent = assessment.students.length;
    }

    res.json({
      success: true,
      message: 'Assessment deadline updated successfully',
      data: {
        assessmentId: assessment._id,
        oldDate,
        newDate,
        notificationsSent,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export calendar to iCal format
 */
const exportCalendar = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.query;

    // Verify permission
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Get user
    const user = await User.findById(userId).select('name email role');

    // Get events based on role
    let events = [];
    const dateRange = start && end
      ? { start: new Date(start), end: new Date(end) }
      : calendarService.getDateRangeForView(new Date(), 'month');

    if (user.role === 'student') {
      const assessments = await Assessment.find({
        students: userId,
        deadline: { $gte: dateRange.start, $lte: dateRange.end },
      }).lean();
      events = assessments.map((a) => calendarService.formatEventForCalendar(a, 'assessment'));
    } else if (user.role === 'instructor') {
      const assessments = await Assessment.find({
        createdBy: userId,
        deadline: { $gte: dateRange.start, $lte: dateRange.end },
      }).lean();
      events = assessments.map((a) => calendarService.formatEventForCalendar(a, 'assessment'));
    }

    // Generate iCal file
    const icalContent = calendarService.generateICalFile(events, {
      name: user.name,
      email: user.email,
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="calendar_${user.name.replace(/\s/g, '_')}.ics"`);
    res.send(icalContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentCalendar,
  getInstructorCalendar,
  getAdminCalendar,
  getEventsByDateRange,
  updateAssessmentDate,
  exportCalendar,
};
