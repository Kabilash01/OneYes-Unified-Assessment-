const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');

/**
 * Get all submissions
 * @route GET /api/student/submissions
 */
exports.getSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const studentId = req.user.id;

    const query = { studentId };

    if (status && status !== 'all') {
      query.status = status;
    }

    let submissions = await Submission.find(query)
      .populate({
        path: 'assessmentId',
        select: 'title totalMarks subjects'
      })
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Filter by search if provided
    if (search) {
      submissions = submissions.filter(s =>
        s.assessmentId?.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Submission.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        submissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get submission details
 * @route GET /api/student/submissions/:id
 */
exports.getSubmissionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const submission = await Submission.findOne({
      _id: id,
      studentId
    })
      .populate({
        path: 'assessmentId',
        populate: {
          path: 'createdBy',
          select: 'name email profilePic'
        }
      })
      .populate('evaluatedBy', 'name email profilePic');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Calculate statistics
    const assessment = submission.assessmentId;
    const totalQuestions = assessment.questions.length;
    const answeredQuestions = submission.answers.filter(a => a.answer !== null && a.answer !== '').length;
    const correctAnswers = submission.answers.filter(a => a.isCorrect === true).length;

    res.status(200).json({
      success: true,
      data: {
        submission,
        statistics: {
          totalQuestions,
          answeredQuestions,
          correctAnswers,
          accuracy: totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(2) : 0,
          percentage: assessment.totalMarks > 0 ? ((submission.score / assessment.totalMarks) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get submission details error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
