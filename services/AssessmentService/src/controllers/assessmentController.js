const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');

const canModify = (ownerId, user) => user.role === 'admin' || String(ownerId) === String(user.id);

const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const assignments = await Assignment.find({ course_id: courseId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { assignments }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      description,
      dueDate,
      maxPoints,
      instructions,
      fileRequirements,
      rubric,
      status
    } = req.body;

    if (!title || !description || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'title, description and dueDate are required'
      });
    }

    // Process rubric to add order if not present
    const processedRubric = (rubric || []).map((criterion, index) => ({
      ...criterion,
      order: criterion.order ?? index
    }));

    const assignment = await Assignment.create({
      course_id: courseId,
      title,
      description,
      dueDate,
      maxPoints: Number(maxPoints) > 0 ? Number(maxPoints) : 100,
      owner_id: String(req.user.id),
      owner_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Tutor',
      instructions: instructions || '',
      fileRequirements: fileRequirements || undefined,
      rubric: processedRubric,
      status: status || 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: { assignment }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message
    });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (!canModify(assignment.owner_id, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can update this assignment'
      });
    }

    const allowed = [
      'title',
      'description',
      'dueDate',
      'maxPoints',
      'instructions',
      'fileRequirements',
      'rubric',
      'status'
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'maxPoints') {
          assignment[field] = Number(req.body[field]);
        } else if (field === 'rubric') {
          // Process rubric to add order
          assignment[field] = req.body[field].map((criterion, index) => ({
            ...criterion,
            order: criterion.order ?? index
          }));
        } else {
          assignment[field] = req.body[field];
        }
      }
    });

    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: { assignment }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment',
      error: error.message
    });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (!canModify(assignment.owner_id, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete this assignment'
      });
    }

    await Assignment.findByIdAndDelete(assignmentId);

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: error.message
    });
  }
};

const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await Quiz.find({ course_id: courseId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { quizzes }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

const createQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      description,
      timeLimit,
      totalPoints,
      questions,
      shuffleQuestions,
      showCorrectAnswers,
      status
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'title and description are required'
      });
    }

    // Process questions to add order if not present
    const processedQuestions = (questions || []).map((q, index) => ({
      ...q,
      order: q.order ?? index
    }));

    const quiz = await Quiz.create({
      course_id: courseId,
      title,
      description,
      timeLimit: Number(timeLimit) > 0 ? Number(timeLimit) : 15,
      totalPoints: Number(totalPoints) > 0 ? Number(totalPoints) : 50,
      owner_id: String(req.user.id),
      owner_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Tutor',
      questions: processedQuestions,
      shuffleQuestions: Boolean(shuffleQuestions),
      showCorrectAnswers: showCorrectAnswers !== false,
      status: status || 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (!canModify(quiz.owner_id, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can update this quiz'
      });
    }

    const allowed = [
      'title',
      'description',
      'timeLimit',
      'totalPoints',
      'questions',
      'shuffleQuestions',
      'showCorrectAnswers',
      'status'
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (['timeLimit', 'totalPoints'].includes(field)) {
          quiz[field] = Number(req.body[field]);
        } else if (field === 'questions') {
          // Process questions to add order
          quiz[field] = req.body[field].map((q, index) => ({
            ...q,
            order: q.order ?? index
          }));
        } else {
          quiz[field] = req.body[field];
        }
      }
    });

    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: { quiz }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz',
      error: error.message
    });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (!canModify(quiz.owner_id, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can delete this quiz'
      });
    }

    await Quiz.findByIdAndDelete(quizId);

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
};

module.exports = {
  getCourseAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getCourseQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz
};
