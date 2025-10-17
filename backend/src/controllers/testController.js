const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

/**
 * Start or resume assessment
 * @route POST /api/student/assessments/:id/start
 */
exports.startAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    // Check if assessment exists and is accessible
    const assessment = await Assessment.findOne({
      _id: id,
      status: 'published',
      $or: [
        { assignedTo: studentId },
        { isPublic: true }
      ]
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or not accessible'
      });
    }

    // Check dates
    const now = new Date();
    if (new Date(assessment.startDate) > now) {
      return res.status(400).json({
        success: false,
        message: 'Assessment has not started yet'
      });
    }

    if (new Date(assessment.endDate) < now) {
      return res.status(400).json({
        success: false,
        message: 'Assessment has expired'
      });
    }

    // Check for existing submission
    let submission = await Submission.findOne({
      assessmentId: id,
      studentId
    });

    // If already submitted, don't allow restart
    if (submission && (submission.status === 'submitted' || submission.status === 'evaluated')) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assessment'
      });
    }

    // Create new submission if doesn't exist
    if (!submission) {
      submission = await Submission.create({
        assessmentId: id,
        studentId,
        answers: assessment.questions.map(q => ({
          questionId: q._id,
          answer: null,
          isCorrect: null,
          marksAwarded: 0
        })),
        status: 'in-progress',
        startedAt: new Date()
      });

      // Create activity
      await Activity.create({
        userId: studentId,
        type: 'assessment_started',
        title: `Started ${assessment.title}`,
        relatedId: assessment._id
      });
    }

    res.status(200).json({
      success: true,
      data: {
        submission,
        assessment
      }
    });
  } catch (error) {
    console.error('Start assessment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Save answer (auto-save)
 * @route PUT /api/student/submissions/:id/answer
 */
exports.saveAnswer = async (req, res) => {
  try {
    const { id } = req.params; // submission id
    const { questionId, answer } = req.body;
    const studentId = req.user.id;

    const submission = await Submission.findOne({
      _id: id,
      studentId,
      status: 'in-progress'
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or already submitted'
      });
    }

    // Find the answer in the array
    const answerIndex = submission.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    if (answerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in submission'
      });
    }

    // Update the answer
    submission.answers[answerIndex].answer = answer;
    submission.lastSavedAt = new Date();

    // Auto-evaluate MCQ if applicable
    const assessment = await Assessment.findById(submission.assessmentId);
    const question = assessment.questions.id(questionId);

    if (question && question.type === 'mcq' && question.correctAnswer) {
      const isCorrect = JSON.stringify(answer) === JSON.stringify(question.correctAnswer);
      submission.answers[answerIndex].isCorrect = isCorrect;
      submission.answers[answerIndex].marksAwarded = isCorrect ? question.marks : 0;
    }

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Answer saved successfully',
      data: { lastSavedAt: submission.lastSavedAt }
    });
  } catch (error) {
    console.error('Save answer error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Submit assessment
 * @route POST /api/student/submissions/:id/submit
 */
exports.submitAssessment = async (req, res) => {
  try {
    const { id } = req.params; // submission id
    const studentId = req.user.id;

    const submission = await Submission.findOne({
      _id: id,
      studentId,
      status: 'in-progress'
    }).populate('assessmentId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or already submitted'
      });
    }

    const assessment = submission.assessmentId;

    // Auto-evaluate all MCQ questions
    let totalScore = 0;
    submission.answers.forEach((ans, index) => {
      const question = assessment.questions.id(ans.questionId);
      if (question && question.type === 'mcq' && question.correctAnswer) {
        const isCorrect = JSON.stringify(ans.answer) === JSON.stringify(question.correctAnswer);
        ans.isCorrect = isCorrect;
        ans.marksAwarded = isCorrect ? question.marks : 0;
        totalScore += ans.marksAwarded;
      }
    });

    submission.score = totalScore;
    submission.status = 'submitted';
    submission.submittedAt = new Date();

    await submission.save();

    // Create activity
    await Activity.create({
      userId: studentId,
      type: 'assessment_completed',
      title: `Completed ${assessment.title}`,
      description: `Score: ${totalScore}/${assessment.totalMarks}`,
      relatedId: assessment._id
    });

    // Create notification for auto-graded result
    const mcqCount = assessment.questions.filter(q => q.type === 'mcq').length;
    if (mcqCount === assessment.questions.length) {
      await Notification.create({
        userId: studentId,
        type: 'result',
        title: 'Assessment Results Available',
        message: `Your score for ${assessment.title}: ${totalScore}/${assessment.totalMarks}`,
        link: `/student/submissions/${submission._id}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      data: {
        submission,
        score: totalScore,
        totalMarks: assessment.totalMarks,
        percentage: ((totalScore / assessment.totalMarks) * 100).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
