const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const User = require('../models/User');

/**
 * @route   GET /api/student/dashboard/stats
 * @desc    Get student dashboard statistics
 * @access  Private (Student)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all student submissions
    const allSubmissions = await Submission.find({ student: studentId });
    const currentMonthSubmissions = await Submission.find({
      student: studentId,
      submittedAt: { $gte: currentMonth },
    });

    // Get last month submissions for comparison
    const lastMonthSubmissions = await Submission.find({
      student: studentId,
      submittedAt: { $gte: lastMonth, $lt: currentMonth },
    });

    // Calculate total assessments taken
    const totalAssessments = allSubmissions.length;
    const totalAssessmentsTrend =
      currentMonthSubmissions.length > 0
        ? `+${currentMonthSubmissions.length} this month`
        : 'No new assessments this month';

    // Calculate average score
    const gradedSubmissions = allSubmissions.filter(
      (sub) => sub.status === 'evaluated' && sub.totalMarks > 0
    );
    const averageScore =
      gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((acc, sub) => acc + (sub.obtainedMarks / sub.totalMarks) * 100, 0) /
          gradedSubmissions.length
        : 0;

    // Calculate last month average for trend
    const lastMonthGraded = lastMonthSubmissions.filter(
      (sub) => sub.status === 'evaluated' && sub.totalMarks > 0
    );
    const lastMonthAvg =
      lastMonthGraded.length > 0
        ? lastMonthGraded.reduce((acc, sub) => acc + (sub.obtainedMarks / sub.totalMarks) * 100, 0) /
          lastMonthGraded.length
        : 0;

    const scoreDiff = averageScore - lastMonthAvg;
    const averageScoreTrend =
      lastMonthGraded.length > 0
        ? `${scoreDiff > 0 ? '+' : ''}${scoreDiff.toFixed(1)}% from last month`
        : 'No data from last month';

    // Count pending evaluations
    const pendingEvaluations = allSubmissions.filter(
      (sub) => sub.status === 'submitted'
    ).length;

    // Count upcoming tests (published, not started, within date range)
    const upcomingTests = await Assessment.countDocuments({
      status: 'published',
      isPublic: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      _id: {
        $nin: allSubmissions.map((sub) => sub.assessment),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalAssessments,
        totalAssessmentsTrend,
        averageScore: parseFloat(averageScore.toFixed(1)),
        averageScoreTrend,
        pendingEvaluations,
        upcomingTests,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/student/dashboard/performance-trend
 * @desc    Get student performance trend for last 6 months
 * @access  Private (Student)
 */
const getPerformanceTrend = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Get all evaluated submissions from last 6 months
    const submissions = await Submission.find({
      student: studentId,
      status: 'evaluated',
      submittedAt: { $gte: sixMonthsAgo },
    }).sort({ submittedAt: 1 });

    // Group by month and calculate average
    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    submissions.forEach((sub) => {
      const month = sub.submittedAt.getMonth();
      const year = sub.submittedAt.getFullYear();
      const key = `${year}-${month}`;

      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: monthNames[month],
          scores: [],
          total: 0,
          count: 0,
        };
      }

      if (sub.totalMarks > 0) {
        const percentage = (sub.obtainedMarks / sub.totalMarks) * 100;
        monthlyData[key].scores.push(percentage);
        monthlyData[key].total += percentage;
        monthlyData[key].count += 1;
      }
    });

    // Generate data for last 6 months (even if no submissions)
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      data.push({
        month: monthNames[month],
        score: monthlyData[key]
          ? parseFloat((monthlyData[key].total / monthlyData[key].count).toFixed(1))
          : 0,
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/student/dashboard/upcoming-assessments
 * @desc    Get upcoming assessments for student
 * @access  Private (Student)
 */
const getUpcomingAssessments = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const now = new Date();
    const limit = parseInt(req.query.limit) || 5;

    // Get student submissions to exclude completed assessments
    const submissions = await Submission.find({ student: studentId }).select('assessment');
    const completedAssessmentIds = submissions.map((sub) => sub.assessment);

    // Find upcoming assessments
    const assessments = await Assessment.find({
      status: 'published',
      isPublic: true,
      endDate: { $gte: now },
      _id: { $nin: completedAssessmentIds },
    })
      .populate('createdBy', 'name profilePic')
      .sort({ startDate: 1 })
      .limit(limit)
      .lean();

    // Add computed fields
    const enrichedAssessments = assessments.map((assessment) => {
      const startDate = new Date(assessment.startDate);
      const isAvailable = startDate <= now;
      const diffMs = startDate - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

      let startsIn = '';
      if (isAvailable) {
        startsIn = 'Available Now';
      } else if (diffDays > 1) {
        startsIn = `Starts in ${diffDays} days`;
      } else if (diffHours > 1) {
        startsIn = `Starts in ${diffHours} hours`;
      } else {
        startsIn = 'Starts soon';
      }

      return {
        _id: assessment._id,
        title: assessment.title,
        description: assessment.description,
        subjects: assessment.subjects,
        instructor: {
          name: assessment.createdBy?.name || 'Unknown',
          avatar: assessment.createdBy?.profilePic || '',
        },
        scheduledDate: assessment.startDate,
        endDate: assessment.endDate,
        duration: assessment.duration,
        totalMarks: assessment.totalMarks,
        status: isAvailable ? 'available' : 'upcoming',
        startsIn,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        assessments: enrichedAssessments,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/student/dashboard/recent-activity
 * @desc    Get recent activity for student
 * @access  Private (Student)
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent submissions with assessment details
    const submissions = await Submission.find({ student: studentId })
      .populate('assessment', 'title subjects')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    // Convert submissions to activity format
    const activities = [];

    submissions.forEach((sub) => {
      // Activity for submission completion
      if (sub.submittedAt) {
        activities.push({
          type: 'completed',
          title: `Completed ${sub.assessment?.title || 'Assessment'}`,
          timestamp: sub.submittedAt,
          details: sub.status === 'evaluated' ? `Score: ${Math.round((sub.obtainedMarks / sub.totalMarks) * 100)}%` : 'Pending evaluation',
          assessmentId: sub.assessment?._id,
        });
      }

      // Activity for score received
      if (sub.status === 'evaluated' && sub.evaluatedAt) {
        const scorePercentage = Math.round((sub.obtainedMarks / sub.totalMarks) * 100);
        activities.push({
          type: 'score_received',
          title: `Received score for ${sub.assessment?.title || 'Assessment'}`,
          timestamp: sub.evaluatedAt,
          details: `Score: ${scorePercentage}% (${sub.obtainedMarks}/${sub.totalMarks})`,
          assessmentId: sub.assessment?._id,
        });
      }
    });

    // Get recently assigned (published) assessments
    const recentAssessments = await Assessment.find({
      status: 'published',
      isPublic: true,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    recentAssessments.forEach((assessment) => {
      activities.push({
        type: 'assigned',
        title: `New assessment available: ${assessment.title}`,
        timestamp: assessment.createdAt,
        details: `Due: ${new Date(assessment.endDate).toLocaleDateString()}`,
        assessmentId: assessment._id,
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit to requested number
    const limitedActivities = activities.slice(0, limit);

    res.status(200).json({
      success: true,
      data: {
        activities: limitedActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getPerformanceTrend,
  getUpcomingAssessments,
  getRecentActivity,
};
