const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const mongoose = require('mongoose');

/**
 * @route   GET /api/student/assessments
 * @desc    Get available assessments for student with enhanced filtering
 * @access  Private (Student)
 */
const getAvailableAssessments = async (req, res, next) => {
  try {
    const { 
      subject, 
      status, 
      search, 
      instructor, 
      dateFrom, 
      dateTo, 
      type,
      sort = 'recent',
      page = 1, 
      limit = 10 
    } = req.query;
    const studentId = req.user._id;

    // Build query
    const query = {
      status: 'published',
      $or: [
        { isPublic: true },
        { assignedTo: studentId },
      ],
    };

    // Subject filter
    if (subject) {
      query.subjects = subject;
    }

    // Search filter
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      });
    }

    // Instructor filter
    if (instructor) {
      query.createdBy = instructor;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.$and = query.$and || [];
      const dateFilter = {};
      if (dateFrom) {
        dateFilter.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        dateFilter.$lte = new Date(dateTo);
      }
      query.$and.push({ startDate: dateFilter });
    }

    // Assessment type filter (based on question types)
    if (type && type !== 'all') {
      query.$and = query.$and || [];
      if (type === 'mcq-only') {
        query.$and.push({ 'questions.type': { $all: ['mcq'] } });
      } else if (type === 'written') {
        query.$and.push({ 
          'questions.type': { 
            $in: ['short-answer', 'long-answer'] 
          } 
        });
      } else if (type === 'mixed') {
        query.$and.push({ 
          'questions.type': { 
            $all: ['mcq'], 
            $in: ['short-answer', 'long-answer'] 
          } 
        });
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Determine sort order
    let sortQuery = {};
    switch (sort) {
      case 'recent':
        sortQuery = { createdAt: -1 };
        break;
      case 'alphabetical':
        sortQuery = { title: 1 };
        break;
      case 'duration':
        sortQuery = { duration: 1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const assessments = await Assessment.find(query)
      .populate('createdBy', 'name email avatar')
      .select('-questions.correctAnswer') // Don't send correct answers
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Assessment.countDocuments(query);

    // Add assessment status for each assessment
    const assessmentsWithStatus = await Promise.all(
      assessments.map(async (assessment) => {
        const submission = await Submission.findOne({
          assessmentId: assessment._id,
          studentId
        });

        let assessmentStatus = 'available';
        const now = new Date();

        if (submission) {
          if (submission.status === 'submitted' || submission.status === 'evaluated') {
            assessmentStatus = 'completed';
          } else if (submission.status === 'in-progress') {
            assessmentStatus = 'in-progress';
          }
        } else if (new Date(assessment.startDate) > now) {
          assessmentStatus = 'upcoming';
        } else if (new Date(assessment.endDate) < now) {
          assessmentStatus = 'expired';
        }

        return {
          ...assessment.toObject(),
          assessmentStatus,
          submissionId: submission?._id
        };
      })
    );

    // Get filter options for frontend
    const subjects = await Assessment.distinct('subjects', {
      status: 'published',
      $or: [{ isPublic: true }, { assignedTo: studentId }]
    });

    const User = require('../models/User');
    const instructorIds = await Assessment.find({
      status: 'published',
      $or: [{ isPublic: true }, { assignedTo: studentId }]
    }).distinct('createdBy');
    
    const instructors = await User.find({ 
      _id: { $in: instructorIds } 
    }).select('name email avatar');

    res.status(200).json({
      success: true,
      data: {
        assessments: assessmentsWithStatus,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
        filters: {
          subjects,
          instructors
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/student/assessments/:id
 * @desc    Get specific assessment details
 * @access  Private (Student)
 */
const getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const assessment = await Assessment.findOne({
      _id: id,
      status: 'published',
      $or: [{ isPublic: true }, { assignedTo: studentId }],
    })
      .populate('createdBy', 'name email')
      .select('-questions.correctAnswer');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or not accessible',
      });
    }

    // Check if student has already started this assessment
    const existingSubmission = await Submission.findOne({
      assessmentId: id,
      studentId,
    });

    res.status(200).json({
      success: true,
      data: {
        assessment,
        hasStarted: !!existingSubmission,
        submissionId: existingSubmission?._id,
        submissionStatus: existingSubmission?.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/student/assessments/:id/start
 * @desc    Start an assessment (create submission)
 * @access  Private (Student)
 */
const startAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    // Check if assessment exists and is accessible
    const assessment = await Assessment.findOne({
      _id: id,
      status: 'published',
      $or: [{ isPublic: true }, { assignedTo: studentId }],
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or not accessible',
      });
    }

    // Check if already started
    const existingSubmission = await Submission.findOne({
      assessmentId: id,
      studentId,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already started this assessment',
        data: { submissionId: existingSubmission._id },
      });
    }

    // Create new submission
    const submission = await Submission.create({
      assessmentId: id,
      studentId,
      answers: [],
      status: 'in-progress',
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Assessment started successfully',
      data: { submission },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/student/submissions/:id/answer
 * @desc    Save/update answer (auto-save)
 * @access  Private (Student)
 */
const saveAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionId, answer } = req.body;
    const studentId = req.user._id;

    // Find submission
    const submission = await Submission.findOne({
      _id: id,
      studentId,
      status: 'in-progress',
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or already submitted',
      });
    }

    // Check if answer already exists for this question
    const existingAnswerIndex = submission.answers.findIndex(
      (ans) => ans.questionId.toString() === questionId
    );

    if (existingAnswerIndex !== -1) {
      // Update existing answer
      submission.answers[existingAnswerIndex].answer = answer;
    } else {
      // Add new answer
      submission.answers.push({
        questionId,
        answer,
      });
    }

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Answer saved successfully',
      data: { submission },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/student/submissions/:id/submit
 * @desc    Submit assessment
 * @access  Private (Student)
 */
const submitAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    // Find submission
    const submission = await Submission.findOne({
      _id: id,
      studentId,
      status: 'in-progress',
    }).populate('assessmentId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or already submitted',
      });
    }

    // Auto-evaluate MCQ questions
    const assessment = submission.assessmentId;
    const autoScore = submission.autoEvaluate(assessment.questions);

    // Update submission
    submission.status = 'submitted';
    submission.submittedAt = new Date();
    submission.score = autoScore;

    // Check if all questions are MCQ (auto-evaluated)
    const allMCQ = assessment.questions.every((q) => q.type === 'mcq');
    if (allMCQ) {
      submission.status = 'evaluated';
      submission.evaluatedAt = new Date();
    }

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      data: { submission },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/student/submissions
 * @desc    Get all submissions for student
 * @access  Private (Student)
 */
const getSubmissions = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { studentId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await Submission.find(query)
      .populate('assessmentId', 'title description totalMarks duration')
      .populate('evaluatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        submissions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/student/submissions/:id
 * @desc    Get submission details with results
 * @access  Private (Student)
 */
const getSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const submission = await Submission.findOne({
      _id: id,
      studentId,
    })
      .populate('assessmentId')
      .populate('evaluatedBy', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { submission },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/student/dashboard/stats
 * @desc    Get student dashboard statistics
 * @access  Private (Student)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Total submissions
    const totalSubmissions = await Submission.countDocuments({ studentId });

    // Submissions by status
    const submissionsByStatus = await Submission.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Average score
    const evaluatedSubmissions = await Submission.find({
      studentId,
      status: 'evaluated',
    }).populate('assessmentId', 'totalMarks');

    let averageScore = 0;
    if (evaluatedSubmissions.length > 0) {
      const totalPercentage = evaluatedSubmissions.reduce((sum, sub) => {
        const percentage = (sub.score / sub.assessmentId.totalMarks) * 100;
        return sum + percentage;
      }, 0);
      averageScore = totalPercentage / evaluatedSubmissions.length;
    }

    // Available assessments count
    const availableAssessments = await Assessment.countDocuments({
      status: 'published',
      $or: [{ isPublic: true }, { assignedTo: studentId }],
    });

    res.status(200).json({
      success: true,
      data: {
        totalSubmissions,
        submissionsByStatus,
        averageScore: averageScore.toFixed(2),
        availableAssessments,
        recentSubmissions: evaluatedSubmissions.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/student/assessments/calendar
 * @desc    Get assessments organized by date for calendar view
 * @access  Private (Student)
 */
const getAssessmentCalendar = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const studentId = req.user._id;

    // Parse month and year or use current date
    const targetDate = new Date(
      year || new Date().getFullYear(),
      month ? parseInt(month) - 1 : new Date().getMonth(),
      1
    );

    // Get first and last day of the month
    const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    // Find assessments in this month
    const assessments = await Assessment.find({
      status: 'published',
      $or: [{ isPublic: true }, { assignedTo: studentId }],
      $or: [
        { startDate: { $gte: firstDay, $lte: lastDay } },
        { endDate: { $gte: firstDay, $lte: lastDay } },
        {
          $and: [
            { startDate: { $lte: firstDay } },
            { endDate: { $gte: lastDay } },
          ],
        },
      ],
    })
      .populate('createdBy', 'name email')
      .select('title description startDate endDate duration totalMarks subjects')
      .sort({ startDate: 1 });

    // Check for existing submissions
    const submissionMap = {};
    const submissions = await Submission.find({
      studentId,
      assessmentId: { $in: assessments.map(a => a._id) },
    }).select('assessmentId status');

    submissions.forEach(sub => {
      submissionMap[sub.assessmentId.toString()] = sub.status;
    });

    // Organize assessments by date with status
    const calendarData = assessments.map(assessment => {
      const now = new Date();
      const startDate = new Date(assessment.startDate);
      const endDate = new Date(assessment.endDate);
      
      let status = 'upcoming';
      let color = 'gray';
      
      // Determine status
      const submissionStatus = submissionMap[assessment._id.toString()];
      if (submissionStatus === 'evaluated' || submissionStatus === 'submitted') {
        status = 'completed';
        color = 'blue';
      } else if (submissionStatus === 'in-progress') {
        status = 'in-progress';
        color = 'yellow';
      } else if (endDate < now) {
        status = 'expired';
        color = 'red';
      } else if (endDate - now < 24 * 60 * 60 * 1000) {
        status = 'deadline-soon';
        color = 'orange';
      } else if (startDate <= now && endDate >= now) {
        status = 'available';
        color = 'green';
      } else if (startDate - now < 24 * 60 * 60 * 1000) {
        status = 'starting-soon';
        color = 'yellow';
      }

      return {
        ...assessment.toObject(),
        status,
        color,
        submissionStatus,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        month: targetDate.getMonth() + 1,
        year: targetDate.getFullYear(),
        assessments: calendarData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/student/instructors
 * @desc    Get list of instructors for filtering
 * @access  Private (Student)
 */
const getInstructors = async (req, res, next) => {
  try {
    const User = require('../models/User');
    
    const instructors = await User.find({ role: 'instructor' })
      .select('name email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: { instructors },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableAssessments,
  getAssessmentById,
  startAssessment,
  saveAnswer,
  submitAssessment,
  getSubmissions,
  getSubmissionById,
  getDashboardStats,
  getAssessmentCalendar,
  getInstructors,
};
