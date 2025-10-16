const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * @route   GET /api/instructor/dashboard/stats
 * @desc    Get instructor dashboard statistics
 * @access  Private (Instructor)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const instructorId = req.user._id;

    // Total assessments created
    const totalAssessments = await Assessment.countDocuments({ createdBy: instructorId });

    // Assessments by status
    const assessmentsByStatus = await Assessment.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(instructorId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Total submissions to evaluate
    const assessmentIds = await Assessment.find({ createdBy: instructorId }).distinct('_id');
    
    const totalSubmissions = await Submission.countDocuments({
      assessmentId: { $in: assessmentIds },
    });

    const pendingEvaluations = await Submission.countDocuments({
      assessmentId: { $in: assessmentIds },
      status: 'submitted',
    });

    // Recent submissions
    const recentSubmissions = await Submission.find({
      assessmentId: { $in: assessmentIds },
    })
      .populate('studentId', 'name email')
      .populate('assessmentId', 'title')
      .sort({ submittedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalAssessments,
        assessmentsByStatus,
        totalSubmissions,
        pendingEvaluations,
        recentSubmissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/instructor/assessments
 * @desc    Create new assessment
 * @access  Private (Instructor)
 */
const createAssessment = async (req, res, next) => {
  try {
    const instructorId = req.user._id;
    const assessmentData = {
      ...req.body,
      createdBy: instructorId,
    };

    // Validate total marks matches sum of question marks
    if (assessmentData.questions && assessmentData.questions.length > 0) {
      const calculatedTotal = assessmentData.questions.reduce(
        (sum, q) => sum + (q.marks || 0),
        0
      );
      
      if (calculatedTotal !== assessmentData.totalMarks) {
        return res.status(400).json({
          success: false,
          message: `Total marks (${assessmentData.totalMarks}) does not match sum of question marks (${calculatedTotal})`,
        });
      }
    }

    const assessment = await Assessment.create(assessmentData);

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: { assessment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/instructor/assessments/:id
 * @desc    Update assessment
 * @access  Private (Instructor)
 */
const updateAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const instructorId = req.user._id;

    // Check if assessment exists and belongs to instructor
    const assessment = await Assessment.findOne({
      _id: id,
      createdBy: instructorId,
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or you do not have permission to edit it',
      });
    }

    // Don't allow editing if submissions exist
    const submissionCount = await Submission.countDocuments({ assessmentId: id });
    if (submissionCount > 0 && assessment.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit published assessment with existing submissions',
      });
    }

    // Update assessment
    const updatedAssessment = await Assessment.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      data: { assessment: updatedAssessment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/instructor/assessments/:id
 * @desc    Delete assessment
 * @access  Private (Instructor)
 */
const deleteAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const instructorId = req.user._id;

    // Check if assessment exists and belongs to instructor
    const assessment = await Assessment.findOne({
      _id: id,
      createdBy: instructorId,
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or you do not have permission to delete it',
      });
    }

    // Don't allow deletion if submissions exist
    const submissionCount = await Submission.countDocuments({ assessmentId: id });
    if (submissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete assessment with existing submissions. Archive it instead.',
      });
    }

    await Assessment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/instructor/assessments
 * @desc    Get all assessments created by instructor
 * @access  Private (Instructor)
 */
const getAssessments = async (req, res, next) => {
  try {
    const instructorId = req.user._id;
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = { createdBy: instructorId };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const assessments = await Assessment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Assessment.countDocuments(query);

    // Get submission counts for each assessment
    const assessmentsWithStats = await Promise.all(
      assessments.map(async (assessment) => {
        const submissionCount = await Submission.countDocuments({
          assessmentId: assessment._id,
        });
        const pendingCount = await Submission.countDocuments({
          assessmentId: assessment._id,
          status: 'submitted',
        });

        return {
          ...assessment.toObject(),
          submissionCount,
          pendingCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        assessments: assessmentsWithStats,
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
 * @route   GET /api/instructor/assessments/:id/submissions
 * @desc    Get submissions for an assessment
 * @access  Private (Instructor)
 */
const getAssessmentSubmissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const instructorId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    // Verify assessment belongs to instructor
    const assessment = await Assessment.findOne({
      _id: id,
      createdBy: instructorId,
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or you do not have permission to view it',
      });
    }

    const query = { assessmentId: id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await Submission.find(query)
      .populate('studentId', 'name email instituteCode')
      .populate('evaluatedBy', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Submission.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        assessment,
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
 * @route   GET /api/instructor/submissions/:id
 * @desc    Get specific submission for evaluation
 * @access  Private (Instructor)
 */
const getSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const instructorId = req.user._id;

    const submission = await Submission.findById(id)
      .populate('studentId', 'name email instituteCode')
      .populate('assessmentId')
      .populate('evaluatedBy', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Verify assessment belongs to instructor
    if (submission.assessmentId.createdBy.toString() !== instructorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this submission',
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
 * @route   PUT /api/instructor/submissions/:id/evaluate
 * @desc    Evaluate submission
 * @access  Private (Instructor)
 */
const evaluateSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const instructorId = req.user._id;
    const { score, feedback, answers } = req.body;

    const submission = await Submission.findById(id).populate('assessmentId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Verify assessment belongs to instructor
    if (submission.assessmentId.createdBy.toString() !== instructorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to evaluate this submission',
      });
    }

    // Verify submission is submitted
    if (submission.status === 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot evaluate a submission that is still in progress',
      });
    }

    // Update answer marks if provided
    if (answers && Array.isArray(answers)) {
      answers.forEach((answerUpdate) => {
        const answerIndex = submission.answers.findIndex(
          (ans) => ans.questionId.toString() === answerUpdate.questionId
        );
        if (answerIndex !== -1) {
          submission.answers[answerIndex].marksAwarded = answerUpdate.marksAwarded;
          submission.answers[answerIndex].isCorrect = answerUpdate.isCorrect;
        }
      });
    }

    // Calculate total score if not provided
    let finalScore = score;
    if (!finalScore) {
      finalScore = submission.calculateTotalMarks();
    }

    // Update submission
    submission.status = 'evaluated';
    submission.score = finalScore;
    submission.feedback = feedback;
    submission.evaluatedBy = instructorId;
    submission.evaluatedAt = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Submission evaluated successfully',
      data: { submission },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/instructor/students
 * @desc    Get list of students with performance
 * @access  Private (Instructor)
 */
const getStudents = async (req, res, next) => {
  try {
    const instructorId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    // Get all assessments by instructor
    const assessmentIds = await Assessment.find({ createdBy: instructorId }).distinct('_id');

    // Get all students who have submitted to these assessments
    const studentIds = await Submission.find({
      assessmentId: { $in: assessmentIds },
    }).distinct('studentId');

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student',
    })
      .skip(skip)
      .limit(parseInt(limit));

    // Get performance stats for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const submissions = await Submission.find({
          studentId: student._id,
          assessmentId: { $in: assessmentIds },
          status: 'evaluated',
        }).populate('assessmentId', 'totalMarks');

        const totalSubmissions = submissions.length;
        let averageScore = 0;

        if (totalSubmissions > 0) {
          const totalPercentage = submissions.reduce((sum, sub) => {
            const percentage = (sub.score / sub.assessmentId.totalMarks) * 100;
            return sum + percentage;
          }, 0);
          averageScore = totalPercentage / totalSubmissions;
        }

        return {
          ...student.toPublicJSON(),
          totalSubmissions,
          averageScore: averageScore.toFixed(2),
        };
      })
    );

    const total = studentIds.length;

    res.status(200).json({
      success: true,
      data: {
        students: studentsWithStats,
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

module.exports = {
  getDashboardStats,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessments,
  getAssessmentSubmissions,
  getSubmissionById,
  evaluateSubmission,
  getStudents,
};
