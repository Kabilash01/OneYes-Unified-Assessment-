const analyticsService = require('../services/analyticsService');
const reportService = require('../services/reportService');
const AnalyticsCache = require('../models/AnalyticsCache');
const ScheduledReport = require('../models/ScheduledReport');

// ==================== STUDENT ANALYTICS ====================

/**
 * @desc    Get student analytics
 * @route   GET /api/analytics/student/:studentId
 * @access  Private (Student, Instructor, Admin)
 */
exports.getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // Authorization check - students can only view their own analytics
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this student\'s analytics'
      });
    }

    // Check cache first
    const cacheKey = {
      userId: studentId,
      metricType: 'performance',
      startDate: startDate || null,
      endDate: endDate || null
    };

    const cached = await AnalyticsCache.findOne(cacheKey);
    
    if (cached && cached.expiresAt > new Date()) {
      return res.status(200).json({
        success: true,
        data: cached.data,
        cached: true
      });
    }

    // Fetch fresh data
    const performance = await analyticsService.getStudentPerformance(studentId, startDate, endDate);
    const subjects = await analyticsService.getSubjectBreakdown(studentId);
    const strengths = await analyticsService.getStrengthsWeaknesses(studentId);
    const trend = await analyticsService.getProgressTrend(studentId);

    const analyticsData = {
      performance,
      subjects,
      strengths,
      trend
    };

    // Cache the result
    await AnalyticsCache.create({
      ...cacheKey,
      data: analyticsData
    });

    res.status(200).json({
      success: true,
      data: analyticsData,
      cached: false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Get student comparison data for specific assessment
 * @route   GET /api/analytics/student/:studentId/comparison/:assessmentId
 * @access  Private (Student, Instructor, Admin)
 */
exports.getStudentComparison = async (req, res) => {
  try {
    const { studentId, assessmentId } = req.params;

    // Authorization check
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this comparison'
      });
    }

    const comparison = await analyticsService.getComparisonData(studentId, assessmentId);

    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching comparison data',
      error: error.message
    });
  }
};

// ==================== INSTRUCTOR ANALYTICS ====================

/**
 * @desc    Get instructor analytics overview
 * @route   GET /api/analytics/instructor/:instructorId
 * @access  Private (Instructor, Admin)
 */
exports.getInstructorAnalytics = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { startDate, endDate } = req.query;

    // Authorization check - instructors can only view their own analytics
    if (req.user.role === 'instructor' && req.user._id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this instructor\'s analytics'
      });
    }

    // Check cache
    const cacheKey = {
      userId: instructorId,
      metricType: 'overview',
      startDate: startDate || null,
      endDate: endDate || null
    };

    const cached = await AnalyticsCache.findOne(cacheKey);
    
    if (cached && cached.expiresAt > new Date()) {
      return res.status(200).json({
        success: true,
        data: cached.data,
        cached: true
      });
    }

    const overview = await analyticsService.getInstructorOverview(instructorId, startDate, endDate);
    const patterns = await analyticsService.getSubmissionPatterns(instructorId);

    const analyticsData = {
      overview,
      patterns
    };

    // Cache the result
    await AnalyticsCache.create({
      ...cacheKey,
      data: analyticsData
    });

    res.status(200).json({
      success: true,
      data: analyticsData,
      cached: false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching instructor analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Get class performance for specific assessment
 * @route   GET /api/analytics/class/:assessmentId
 * @access  Private (Instructor, Admin)
 */
exports.getClassAnalytics = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Check cache
    const cacheKey = {
      userId: req.user._id,
      metricType: 'class',
      startDate: assessmentId
    };

    const cached = await AnalyticsCache.findOne(cacheKey);
    
    if (cached && cached.expiresAt > new Date()) {
      return res.status(200).json({
        success: true,
        data: cached.data,
        cached: true
      });
    }

    const classPerformance = await analyticsService.getClassPerformance(assessmentId);
    const difficulty = await analyticsService.getAssessmentDifficulty(assessmentId);
    const questionStats = await analyticsService.getQuestionStatistics(assessmentId);

    const analyticsData = {
      classPerformance,
      difficulty,
      questionStats
    };

    // Cache the result
    await AnalyticsCache.create({
      ...cacheKey,
      data: analyticsData
    });

    res.status(200).json({
      success: true,
      data: analyticsData,
      cached: false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching class analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Get assessment difficulty analysis
 * @route   GET /api/analytics/assessment/:assessmentId/difficulty
 * @access  Private (Instructor, Admin)
 */
exports.getAssessmentDifficulty = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const difficulty = await analyticsService.getAssessmentDifficulty(assessmentId);

    res.status(200).json({
      success: true,
      data: difficulty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assessment difficulty',
      error: error.message
    });
  }
};

// ==================== ADMIN ANALYTICS ====================

/**
 * @desc    Get platform-wide analytics
 * @route   GET /api/analytics/admin/platform
 * @access  Private (Admin only)
 */
exports.getPlatformAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Check cache
    const cacheKey = {
      userId: req.user._id,
      metricType: 'platform',
      startDate: startDate || null,
      endDate: endDate || null
    };

    const cached = await AnalyticsCache.findOne(cacheKey);
    
    if (cached && cached.expiresAt > new Date()) {
      return res.status(200).json({
        success: true,
        data: cached.data,
        cached: true
      });
    }

    const metrics = await analyticsService.getPlatformMetrics(startDate, endDate);
    const engagement = await analyticsService.getUserEngagement();
    const distribution = await analyticsService.getAssessmentDistribution();
    const instructorPerformance = await analyticsService.getInstructorPerformance();
    const retention = await analyticsService.getStudentRetention();

    const analyticsData = {
      metrics,
      engagement,
      distribution,
      instructorPerformance,
      retention
    };

    // Cache the result
    await AnalyticsCache.create({
      ...cacheKey,
      data: analyticsData
    });

    res.status(200).json({
      success: true,
      data: analyticsData,
      cached: false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching platform analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Get user engagement analytics
 * @route   GET /api/analytics/admin/engagement
 * @access  Private (Admin only)
 */
exports.getUserEngagement = async (req, res) => {
  try {
    const engagement = await analyticsService.getUserEngagement();

    res.status(200).json({
      success: true,
      data: engagement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user engagement',
      error: error.message
    });
  }
};

// ==================== REPORT GENERATION ====================

/**
 * @desc    Generate analytics report (PDF or Excel)
 * @route   POST /api/analytics/reports/generate
 * @access  Private
 */
exports.generateReport = async (req, res) => {
  try {
    const { reportType, format, dataType, options } = req.body;

    // Determine report type based on user role if not specified
    const type = reportType || (req.user.role === 'admin' ? 'admin' : 
                                req.user.role === 'instructor' ? 'instructor' : 'student');

    // Fetch data based on report type
    let data;
    
    if (type === 'student') {
      const performance = await analyticsService.getStudentPerformance(req.user._id);
      const subjects = await analyticsService.getSubjectBreakdown(req.user._id);
      const strengths = await analyticsService.getStrengthsWeaknesses(req.user._id);
      
      data = {
        overall: performance.overall,
        trend: performance.trend,
        subjects,
        strengths
      };
    } else if (type === 'instructor') {
      const overview = await analyticsService.getInstructorOverview(req.user._id);
      
      data = { overview };
      
      // If specific assessment requested
      if (options && options.assessmentId) {
        const classPerformance = await analyticsService.getClassPerformance(options.assessmentId);
        const questionStats = await analyticsService.getQuestionStatistics(options.assessmentId);
        data.classPerformance = classPerformance;
        data.questionStats = questionStats;
      }
    } else if (type === 'admin') {
      const metrics = await analyticsService.getPlatformMetrics();
      const engagement = await analyticsService.getUserEngagement();
      const distribution = await analyticsService.getAssessmentDistribution();
      const instructorPerformance = await analyticsService.getInstructorPerformance();
      
      data = {
        metrics,
        engagement,
        distribution,
        instructorPerformance
      };
    }

    // Generate report
    const reportBuffer = format === 'pdf'
      ? await reportService.generatePDF(type, data, options || {})
      : await reportService.generateExcel(type, data, options || {});

    // Set response headers
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';
    const mimeType = format === 'pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename=analytics_report_${Date.now()}.${extension}`);
    
    res.send(reportBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};

/**
 * @desc    Schedule a report for regular delivery
 * @route   POST /api/analytics/reports/schedule
 * @access  Private
 */
exports.scheduleReport = async (req, res) => {
  try {
    const { reportType, frequency, format, filters } = req.body;

    // Calculate next run time
    const now = new Date();
    const nextRun = new Date();
    
    switch (frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      default:
        nextRun.setDate(nextRun.getDate() + 1);
    }

    const schedule = await reportService.scheduleReport({
      userId: req.user._id,
      reportType: reportType || req.user.role,
      frequency,
      format: format || 'pdf',
      filters: filters || {},
      nextRun
    });

    res.status(201).json({
      success: true,
      data: schedule,
      message: 'Report scheduled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error scheduling report',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's scheduled reports
 * @route   GET /api/analytics/reports/scheduled
 * @access  Private
 */
exports.getScheduledReports = async (req, res) => {
  try {
    const reports = await ScheduledReport.find({
      userId: req.user._id,
      isActive: true
    }).sort({ nextRun: 1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching scheduled reports',
      error: error.message
    });
  }
};

/**
 * @desc    Delete/cancel a scheduled report
 * @route   DELETE /api/analytics/reports/scheduled/:id
 * @access  Private
 */
exports.deleteScheduledReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await ScheduledReport.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled report not found'
      });
    }

    report.isActive = false;
    await report.save();

    res.status(200).json({
      success: true,
      message: 'Scheduled report cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting scheduled report',
      error: error.message
    });
  }
};

/**
 * @desc    Send report via email
 * @route   POST /api/analytics/reports/email
 * @access  Private
 */
exports.emailReport = async (req, res) => {
  try {
    const { reportType, format, options } = req.body;

    const type = reportType || req.user.role;

    // Fetch data
    let data;
    
    if (type === 'student') {
      const performance = await analyticsService.getStudentPerformance(req.user._id);
      const subjects = await analyticsService.getSubjectBreakdown(req.user._id);
      const strengths = await analyticsService.getStrengthsWeaknesses(req.user._id);
      
      data = {
        overall: performance.overall,
        trend: performance.trend,
        subjects,
        strengths
      };
    } else if (type === 'instructor') {
      const overview = await analyticsService.getInstructorOverview(req.user._id);
      data = { overview };
    } else if (type === 'admin') {
      const metrics = await analyticsService.getPlatformMetrics();
      const engagement = await analyticsService.getUserEngagement();
      
      data = { metrics, engagement };
    }

    // Generate report
    const reportBuffer = format === 'pdf'
      ? await reportService.generatePDF(type, data, options || {})
      : await reportService.generateExcel(type, data, options || {});

    // Send email
    await reportService.sendReport(req.user._id, reportBuffer, format || 'pdf', type);

    res.status(200).json({
      success: true,
      message: 'Report sent to your email successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending report',
      error: error.message
    });
  }
};
