const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Analytics Service
 * Provides analytics and statistical data for students, instructors, and admins
 */

class AnalyticsService {
  
  // ==================== STUDENT ANALYTICS ====================

  /**
   * Get student performance analytics
   * @param {String} studentId - Student ID
   * @param {Date} startDate - Start date for analytics
   * @param {Date} endDate - End date for analytics
   * @returns {Object} Performance data
   */
  async getStudentPerformance(studentId, startDate = null, endDate = null) {
    try {
      const matchStage = {
        studentId: new mongoose.Types.ObjectId(studentId),
        status: 'evaluated'
      };

      if (startDate && endDate) {
        matchStage.submittedAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const performance = await Submission.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'assessments',
            localField: 'assessmentId',
            foreignField: '_id',
            as: 'assessment'
          }
        },
        { $unwind: '$assessment' },
        {
          $group: {
            _id: null,
            totalSubmissions: { $sum: 1 },
            totalScore: { $sum: '$score' },
            totalMarks: { $sum: '$assessment.totalMarks' },
            avgScore: { $avg: '$score' },
            maxScore: { $max: '$score' },
            minScore: { $min: '$score' },
            scores: { $push: '$score' }
          }
        },
        {
          $project: {
            totalSubmissions: 1,
            avgScore: { $round: ['$avgScore', 2] },
            avgPercentage: {
              $round: [
                { $multiply: [{ $divide: ['$totalScore', '$totalMarks'] }, 100] },
                2
              ]
            },
            maxScore: 1,
            minScore: 1,
            scores: 1
          }
        }
      ]);

      // Get performance trend (last 10 submissions)
      const trend = await Submission.find(matchStage)
        .sort({ submittedAt: -1 })
        .limit(10)
        .populate('assessmentId', 'title totalMarks')
        .select('score submittedAt');

      return {
        overall: performance[0] || {
          totalSubmissions: 0,
          avgScore: 0,
          avgPercentage: 0,
          maxScore: 0,
          minScore: 0
        },
        trend: trend.reverse().map(s => ({
          date: s.submittedAt,
          score: s.score,
          title: s.assessmentId?.title,
          totalMarks: s.assessmentId?.totalMarks
        }))
      };
    } catch (error) {
      throw new Error(`Error getting student performance: ${error.message}`);
    }
  }

  /**
   * Get subject-wise breakdown for student
   * @param {String} studentId - Student ID
   * @returns {Object} Subject breakdown data
   */
  async getSubjectBreakdown(studentId) {
    try {
      const breakdown = await Submission.aggregate([
        {
          $match: {
            studentId: new mongoose.Types.ObjectId(studentId),
            status: 'evaluated'
          }
        },
        {
          $lookup: {
            from: 'assessments',
            localField: 'assessmentId',
            foreignField: '_id',
            as: 'assessment'
          }
        },
        { $unwind: '$assessment' },
        { $unwind: '$assessment.subjects' },
        {
          $group: {
            _id: '$assessment.subjects',
            count: { $sum: 1 },
            totalScore: { $sum: '$score' },
            avgScore: { $avg: '$score' },
            maxScore: { $max: '$score' },
            minScore: { $min: '$score' }
          }
        },
        {
          $project: {
            subject: '$_id',
            count: 1,
            avgScore: { $round: ['$avgScore', 2] },
            maxScore: 1,
            minScore: 1
          }
        },
        { $sort: { avgScore: -1 } }
      ]);

      return breakdown;
    } catch (error) {
      throw new Error(`Error getting subject breakdown: ${error.message}`);
    }
  }

  /**
   * Get strengths and weaknesses analysis
   * @param {String} studentId - Student ID
   * @returns {Object} Strengths and weaknesses
   */
  async getStrengthsWeaknesses(studentId) {
    try {
      const subjectData = await this.getSubjectBreakdown(studentId);
      
      // Calculate average across all subjects
      const overallAvg = subjectData.reduce((sum, s) => sum + s.avgScore, 0) / (subjectData.length || 1);

      const strengths = subjectData
        .filter(s => s.avgScore >= overallAvg)
        .map(s => ({
          subject: s.subject,
          avgScore: s.avgScore,
          count: s.count
        }));

      const weaknesses = subjectData
        .filter(s => s.avgScore < overallAvg)
        .map(s => ({
          subject: s.subject,
          avgScore: s.avgScore,
          count: s.count
        }));

      return {
        strengths,
        weaknesses,
        overallAvg: Math.round(overallAvg * 100) / 100
      };
    } catch (error) {
      throw new Error(`Error getting strengths/weaknesses: ${error.message}`);
    }
  }

  /**
   * Get progress trend over time
   * @param {String} studentId - Student ID
   * @param {String} period - 'week', 'month', 'quarter', 'year'
   * @returns {Array} Progress data points
   */
  async getProgressTrend(studentId, period = 'month') {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'quarter':
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      const trend = await Submission.aggregate([
        {
          $match: {
            studentId: new mongoose.Types.ObjectId(studentId),
            status: 'evaluated',
            submittedAt: { $gte: startDate }
          }
        },
        {
          $lookup: {
            from: 'assessments',
            localField: 'assessmentId',
            foreignField: '_id',
            as: 'assessment'
          }
        },
        { $unwind: '$assessment' },
        {
          $project: {
            date: '$submittedAt',
            score: 1,
            totalMarks: '$assessment.totalMarks',
            percentage: {
              $multiply: [
                { $divide: ['$score', '$assessment.totalMarks'] },
                100
              ]
            }
          }
        },
        { $sort: { date: 1 } }
      ]);

      return trend;
    } catch (error) {
      throw new Error(`Error getting progress trend: ${error.message}`);
    }
  }

  /**
   * Get comparison with class average
   * @param {String} studentId - Student ID
   * @param {String} assessmentId - Assessment ID
   * @returns {Object} Comparison data
   */
  async getComparisonData(studentId, assessmentId) {
    try {
      // Get student's score
      const studentSubmission = await Submission.findOne({
        studentId,
        assessmentId,
        status: 'evaluated'
      });

      if (!studentSubmission) {
        return { error: 'No submission found' };
      }

      // Get class statistics
      const classStats = await Submission.aggregate([
        {
          $match: {
            assessmentId: new mongoose.Types.ObjectId(assessmentId),
            status: 'evaluated'
          }
        },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$score' },
            maxScore: { $max: '$score' },
            minScore: { $min: '$score' },
            totalStudents: { $sum: 1 }
          }
        }
      ]);

      const stats = classStats[0] || {
        avgScore: 0,
        maxScore: 0,
        minScore: 0,
        totalStudents: 0
      };

      // Calculate percentile
      const lowerScores = await Submission.countDocuments({
        assessmentId,
        status: 'evaluated',
        score: { $lt: studentSubmission.score }
      });

      const percentile = Math.round((lowerScores / stats.totalStudents) * 100);

      return {
        studentScore: studentSubmission.score,
        classAverage: Math.round(stats.avgScore * 100) / 100,
        classMax: stats.maxScore,
        classMin: stats.minScore,
        percentile,
        totalStudents: stats.totalStudents,
        aboveAverage: studentSubmission.score > stats.avgScore
      };
    } catch (error) {
      throw new Error(`Error getting comparison data: ${error.message}`);
    }
  }

  // ==================== INSTRUCTOR ANALYTICS ====================

  /**
   * Get instructor overview analytics
   * @param {String} instructorId - Instructor ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Object} Overview data
   */
  async getInstructorOverview(instructorId, startDate = null, endDate = null) {
    try {
      const matchStage = {
        createdBy: new mongoose.Types.ObjectId(instructorId)
      };

      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Get assessment statistics
      const assessments = await Assessment.find(matchStage);
      const assessmentIds = assessments.map(a => a._id);

      // Get submission statistics
      const submissions = await Submission.aggregate([
        {
          $match: {
            assessmentId: { $in: assessmentIds }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const submissionStats = {
        total: 0,
        evaluated: 0,
        pending: 0,
        inProgress: 0
      };

      submissions.forEach(s => {
        submissionStats.total += s.count;
        submissionStats[s._id === 'evaluated' ? 'evaluated' : 
                        s._id === 'submitted' ? 'pending' : 'inProgress'] += s.count;
      });

      // Get average scores
      const scoreStats = await Submission.aggregate([
        {
          $match: {
            assessmentId: { $in: assessmentIds },
            status: 'evaluated'
          }
        },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$score' },
            maxScore: { $max: '$score' },
            minScore: { $min: '$score' }
          }
        }
      ]);

      return {
        assessments: {
          total: assessments.length,
          published: assessments.filter(a => a.status === 'published').length,
          draft: assessments.filter(a => a.status === 'draft').length,
          archived: assessments.filter(a => a.status === 'archived').length
        },
        submissions: submissionStats,
        scores: scoreStats[0] || { avgScore: 0, maxScore: 0, minScore: 0 }
      };
    } catch (error) {
      throw new Error(`Error getting instructor overview: ${error.message}`);
    }
  }

  /**
   * Get class performance for specific assessment
   * @param {String} assessmentId - Assessment ID
   * @returns {Object} Class performance data
   */
  async getClassPerformance(assessmentId) {
    try {
      const performance = await Submission.aggregate([
        {
          $match: {
            assessmentId: new mongoose.Types.ObjectId(assessmentId),
            status: 'evaluated'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'studentId',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' },
        {
          $lookup: {
            from: 'assessments',
            localField: 'assessmentId',
            foreignField: '_id',
            as: 'assessment'
          }
        },
        { $unwind: '$assessment' },
        {
          $project: {
            studentName: '$student.name',
            studentEmail: '$student.email',
            score: 1,
            totalMarks: '$assessment.totalMarks',
            percentage: {
              $multiply: [
                { $divide: ['$score', '$assessment.totalMarks'] },
                100
              ]
            },
            submittedAt: 1,
            evaluatedAt: 1
          }
        },
        { $sort: { score: -1 } }
      ]);

      // Calculate distribution
      const distribution = {
        excellent: performance.filter(p => p.percentage >= 90).length,
        good: performance.filter(p => p.percentage >= 75 && p.percentage < 90).length,
        average: performance.filter(p => p.percentage >= 60 && p.percentage < 75).length,
        belowAverage: performance.filter(p => p.percentage < 60).length
      };

      return {
        students: performance,
        distribution,
        totalStudents: performance.length,
        avgPercentage: performance.reduce((sum, p) => sum + p.percentage, 0) / (performance.length || 1)
      };
    } catch (error) {
      throw new Error(`Error getting class performance: ${error.message}`);
    }
  }

  /**
   * Get assessment difficulty analysis
   * @param {String} assessmentId - Assessment ID
   * @returns {Object} Difficulty metrics
   */
  async getAssessmentDifficulty(assessmentId) {
    try {
      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }

      const submissions = await Submission.find({
        assessmentId,
        status: 'evaluated'
      });

      if (submissions.length === 0) {
        return {
          difficulty: 'Not enough data',
          avgScore: 0,
          passRate: 0,
          avgTime: 0
        };
      }

      const avgScore = submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length;
      const avgPercentage = (avgScore / assessment.totalMarks) * 100;
      const passRate = (submissions.filter(s => (s.score / assessment.totalMarks) >= 0.6).length / submissions.length) * 100;

      // Determine difficulty level
      let difficulty;
      if (avgPercentage >= 80) difficulty = 'Easy';
      else if (avgPercentage >= 60) difficulty = 'Medium';
      else difficulty = 'Hard';

      return {
        difficulty,
        avgScore: Math.round(avgScore * 100) / 100,
        avgPercentage: Math.round(avgPercentage * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        totalSubmissions: submissions.length,
        recommendation: difficulty === 'Easy' ? 'Consider increasing difficulty' :
                       difficulty === 'Hard' ? 'Consider reducing difficulty' :
                       'Difficulty is well-balanced'
      };
    } catch (error) {
      throw new Error(`Error getting assessment difficulty: ${error.message}`);
    }
  }

  /**
   * Get question-level statistics
   * @param {String} assessmentId - Assessment ID
   * @returns {Array} Question statistics
   */
  async getQuestionStatistics(assessmentId) {
    try {
      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }

      const submissions = await Submission.find({
        assessmentId,
        status: 'evaluated'
      });

      const questionStats = assessment.questions.map((question, index) => {
        let correct = 0;
        let incorrect = 0;
        let partial = 0;

        submissions.forEach(submission => {
          const answer = submission.answers[index];
          if (answer && answer.earnedMarks !== undefined) {
            if (answer.earnedMarks === question.marks) {
              correct++;
            } else if (answer.earnedMarks > 0) {
              partial++;
            } else {
              incorrect++;
            }
          }
        });

        const total = correct + incorrect + partial;
        const successRate = total > 0 ? (correct / total) * 100 : 0;

        return {
          questionNumber: index + 1,
          questionText: question.question.substring(0, 100) + '...',
          type: question.type,
          marks: question.marks,
          correct,
          incorrect,
          partial,
          total,
          successRate: Math.round(successRate * 100) / 100,
          difficulty: successRate >= 70 ? 'Easy' : successRate >= 40 ? 'Medium' : 'Hard'
        };
      });

      return questionStats;
    } catch (error) {
      throw new Error(`Error getting question statistics: ${error.message}`);
    }
  }

  /**
   * Get submission patterns (time-based analysis)
   * @param {String} instructorId - Instructor ID
   * @returns {Object} Submission patterns
   */
  async getSubmissionPatterns(instructorId) {
    try {
      const assessments = await Assessment.find({
        createdBy: instructorId
      }).select('_id');

      const assessmentIds = assessments.map(a => a._id);

      const patterns = await Submission.aggregate([
        {
          $match: {
            assessmentId: { $in: assessmentIds },
            submittedAt: { $exists: true }
          }
        },
        {
          $project: {
            hour: { $hour: '$submittedAt' },
            dayOfWeek: { $dayOfWeek: '$submittedAt' },
            date: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } }
          }
        },
        {
          $group: {
            _id: {
              hour: '$hour',
              dayOfWeek: '$dayOfWeek'
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Daily submission counts
      const dailySubmissions = await Submission.aggregate([
        {
          $match: {
            assessmentId: { $in: assessmentIds },
            submittedAt: { $exists: true }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ]);

      return {
        hourlyPatterns: patterns,
        dailySubmissions: dailySubmissions.map(d => ({
          date: d._id,
          count: d.count
        }))
      };
    } catch (error) {
      throw new Error(`Error getting submission patterns: ${error.message}`);
    }
  }

  // ==================== ADMIN ANALYTICS ====================

  /**
   * Get platform-wide metrics
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Object} Platform metrics
   */
  async getPlatformMetrics(startDate = null, endDate = null) {
    try {
      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // User statistics
      const userStats = await User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      const users = {
        total: 0,
        students: 0,
        instructors: 0,
        admins: 0
      };

      userStats.forEach(u => {
        users.total += u.count;
        users[u._id + 's'] = u.count;
      });

      // Assessment statistics
      const assessmentStats = await Assessment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const assessments = {
        total: 0,
        published: 0,
        draft: 0,
        archived: 0
      };

      assessmentStats.forEach(a => {
        assessments.total += a.count;
        assessments[a._id] = a.count;
      });

      // Submission statistics
      const submissionStats = await Submission.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const submissions = {
        total: 0,
        evaluated: 0,
        pending: 0,
        inProgress: 0
      };

      submissionStats.forEach(s => {
        submissions.total += s.count;
        const status = s._id === 'submitted' ? 'pending' : 
                      s._id === 'in-progress' ? 'inProgress' : s._id;
        submissions[status] = s.count;
      });

      return {
        users,
        assessments,
        submissions,
        generatedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Error getting platform metrics: ${error.message}`);
    }
  }

  /**
   * Get user engagement metrics
   * @returns {Object} Engagement data
   */
  async getUserEngagement() {
    try {
      // Active users (users with submissions in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeStudents = await Submission.distinct('studentId', {
        submittedAt: { $gte: thirtyDaysAgo }
      });

      const activeInstructors = await Assessment.distinct('createdBy', {
        createdAt: { $gte: thirtyDaysAgo }
      });

      // User growth trend (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const userGrowth = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      return {
        activeUsers: {
          students: activeStudents.length,
          instructors: activeInstructors.length,
          total: activeStudents.length + activeInstructors.length
        },
        userGrowth: userGrowth.map(g => ({
          period: `${g._id.year}-${String(g._id.month).padStart(2, '0')}`,
          count: g.count
        }))
      };
    } catch (error) {
      throw new Error(`Error getting user engagement: ${error.message}`);
    }
  }

  /**
   * Get assessment distribution metrics
   * @returns {Object} Distribution data
   */
  async getAssessmentDistribution() {
    try {
      // Distribution by subject
      const subjectDistribution = await Assessment.aggregate([
        { $unwind: '$subjects' },
        {
          $group: {
            _id: '$subjects',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Distribution by instructor
      const instructorDistribution = await Assessment.aggregate([
        {
          $group: {
            _id: '$createdBy',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'instructor'
          }
        },
        { $unwind: '$instructor' },
        {
          $project: {
            instructorName: '$instructor.name',
            count: 1
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        bySubject: subjectDistribution.map(s => ({
          subject: s._id,
          count: s.count
        })),
        byInstructor: instructorDistribution.map(i => ({
          instructor: i.instructorName,
          count: i.count
        }))
      };
    } catch (error) {
      throw new Error(`Error getting assessment distribution: ${error.message}`);
    }
  }

  /**
   * Get instructor performance comparison
   * @returns {Array} Instructor performance data
   */
  async getInstructorPerformance() {
    try {
      const performance = await Assessment.aggregate([
        {
          $lookup: {
            from: 'submissions',
            localField: '_id',
            foreignField: 'assessmentId',
            as: 'submissions'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'instructor'
          }
        },
        { $unwind: '$instructor' },
        {
          $group: {
            _id: '$createdBy',
            instructorName: { $first: '$instructor.name' },
            totalAssessments: { $sum: 1 },
            totalSubmissions: { $sum: { $size: '$submissions' } },
            evaluatedSubmissions: {
              $sum: {
                $size: {
                  $filter: {
                    input: '$submissions',
                    cond: { $eq: ['$$this.status', 'evaluated'] }
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            instructorName: 1,
            totalAssessments: 1,
            totalSubmissions: 1,
            evaluatedSubmissions: 1,
            evaluationRate: {
              $cond: [
                { $eq: ['$totalSubmissions', 0] },
                0,
                {
                  $multiply: [
                    { $divide: ['$evaluatedSubmissions', '$totalSubmissions'] },
                    100
                  ]
                }
              ]
            }
          }
        },
        { $sort: { totalAssessments: -1 } }
      ]);

      return performance.map(p => ({
        instructor: p.instructorName,
        assessments: p.totalAssessments,
        submissions: p.totalSubmissions,
        evaluated: p.evaluatedSubmissions,
        evaluationRate: Math.round(p.evaluationRate * 100) / 100
      }));
    } catch (error) {
      throw new Error(`Error getting instructor performance: ${error.message}`);
    }
  }

  /**
   * Get student retention metrics
   * @returns {Object} Retention data
   */
  async getStudentRetention() {
    try {
      const now = new Date();
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      const twoMonthsAgo = new Date(now.setMonth(now.getMonth() - 2));

      // Active students this month
      const thisMonth = await Submission.distinct('studentId', {
        submittedAt: { $gte: oneMonthAgo }
      });

      // Active students last month
      const lastMonth = await Submission.distinct('studentId', {
        submittedAt: { $gte: twoMonthsAgo, $lt: oneMonthAgo }
      });

      // Retained students (active in both months)
      const retained = thisMonth.filter(id => 
        lastMonth.some(lid => lid.toString() === id.toString())
      );

      const retentionRate = lastMonth.length > 0 
        ? (retained.length / lastMonth.length) * 100 
        : 0;

      return {
        currentActive: thisMonth.length,
        previousActive: lastMonth.length,
        retained: retained.length,
        retentionRate: Math.round(retentionRate * 100) / 100,
        newStudents: thisMonth.length - retained.length
      };
    } catch (error) {
      throw new Error(`Error getting student retention: ${error.message}`);
    }
  }
}

module.exports = new AnalyticsService();
