const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const QuizAttempt = require('../models/QuizAttempt');
const { sendAssignmentSubmittedEmail } = require('../utils/emailService');

const ENROLLMENT_SERVICE_URL = (process.env.ENROLLMENT_SERVICE_URL || 'http://localhost:4004').replace(/\/$/, '');

const canModify = (ownerId, user) => user.role === 'admin' || String(ownerId) === String(user.id);

const getAuthHeader = (req) => req.headers.authorization || '';

const getUserId = (user = {}) => {
  const raw = user.id ?? user.user_id ?? user.sub;
  return raw !== undefined && raw !== null ? String(raw) : null;
};

const getUserName = (user = {}) => {
  const first = user.first_name || user.firstName || '';
  const last = user.last_name || user.lastName || '';
  const full = `${first} ${last}`.trim();
  if (full) return full;
  if (user.email && typeof user.email === 'string') return user.email;
  return 'Student';
};

const buildSubmissionFileUrl = (submissionId) => `/api/assignments/submissions/${submissionId}/file`;

const toSubmissionResponse = (submission) => {
  const plain = submission?.toObject ? submission.toObject() : submission;
  if (!plain) return null;
  return {
    ...plain,
    fileUrl: buildSubmissionFileUrl(plain._id)
  };
};

const getQuestionBasePoints = (question = {}) => {
  const points = Number(question.points);
  if (Number.isFinite(points) && points > 0) {
    return points;
  }
  return 1;
};

const getQuizScoringMeta = (quiz) => {
  const totalQuestionPoints = (quiz.questions || []).reduce(
    (sum, question) => sum + getQuestionBasePoints(question),
    0
  );
  const totalPoints = Number(quiz.totalPoints) > 0 ? Number(quiz.totalPoints) : totalQuestionPoints || 1;
  const scale = totalQuestionPoints > 0 ? totalPoints / totalQuestionPoints : 1;
  return { totalPoints, totalQuestionPoints, scale };
};

const answersAreEqual = (a, b, caseSensitive = false) => {
  if (caseSensitive) {
    return String(a).trim() === String(b).trim();
  }
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
};

const isAnswerCorrect = (question = {}, answer) => {
  if (answer === undefined || answer === null) return false;

  switch (question.type) {
    case 'multiple_choice':
    case 'true_false': {
      const selectedIndex = Number(answer);
      if (!Number.isInteger(selectedIndex)) return false;
      const options = question.options || [];
      const correctIndex = options.findIndex((option) => option.isCorrect);
      return correctIndex >= 0 && selectedIndex === correctIndex;
    }
    case 'short_answer': {
      if (typeof answer !== 'string') return false;
      if (!question.referenceAnswer) return false;
      return answersAreEqual(answer, question.referenceAnswer, question.caseSensitive);
    }
    case 'fill_in_blank': {
      if (!Array.isArray(question.blanks) || !question.blanks.length) return false;
      const values = Array.isArray(answer) ? answer : [answer];
      if (values.length !== question.blanks.length) return false;
      return question.blanks.every((blank, index) => {
        const allowed = Array.isArray(blank.correctAnswers) ? blank.correctAnswers : [];
        if (!allowed.length) return false;
        const studentValue = values[index];
        if (studentValue === undefined || studentValue === null) return false;
        return allowed.some((candidate) => answersAreEqual(studentValue, candidate, question.caseSensitive));
      });
    }
    default:
      return false;
  }
};

const calculateQuizScore = (quiz, answers) => {
  const { totalPoints, scale } = getQuizScoringMeta(quiz);
  let earned = 0;

  (quiz.questions || []).forEach((question, index) => {
    if (isAnswerCorrect(question, answers[index])) {
      earned += getQuestionBasePoints(question) * scale;
    }
  });

  const roundedScore = Math.max(0, Math.min(totalPoints, Number(earned.toFixed(2))));
  const percentage = totalPoints > 0 ? Number(((roundedScore / totalPoints) * 100).toFixed(2)) : 0;
  return { score: roundedScore, totalPoints, percentage };
};

const requireStudentRole = (req, res) => {
  if (req.user.role !== 'student' && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Only students can access this resource'
    });
    return false;
  }
  return true;
};

const parseJson = async (response) => {
  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.message || 'Request failed';
    throw new Error(message);
  }
  return payload;
};

const isStudentEnrolled = async (req, courseId) => {
  const studentId = getUserId(req.user);
  if (!studentId) {
    throw new Error('Invalid token payload: missing student id');
  }
  const url = `${ENROLLMENT_SERVICE_URL}/internal/check?studentId=${encodeURIComponent(String(studentId))}&courseId=${encodeURIComponent(String(courseId))}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: getAuthHeader(req)
    }
  });
  const payload = await parseJson(response);
  return Boolean(payload?.data?.isEnrolled);
};

const getStudentEnrolledCourseIds = async (req) => {
  const response = await fetch(`${ENROLLMENT_SERVICE_URL}/my-course-ids`, {
    method: 'GET',
    headers: {
      Authorization: getAuthHeader(req)
    }
  });
  const payload = await parseJson(response);
  return Array.isArray(payload?.data?.courseIds) ? payload.data.courseIds : [];
};

const syncEnrollmentProgress = async (req, courseId, studentId) => {
  if (!courseId || !studentId) return;

  const normalizedCourseId = String(courseId);
  const normalizedStudentId = String(studentId);

  const [publishedAssignments, publishedQuizzes, submittedAssignmentIds, submittedQuizIds] = await Promise.all([
    Assignment.countDocuments({
      course_id: normalizedCourseId,
      status: 'published'
    }),
    Quiz.countDocuments({
      course_id: normalizedCourseId,
      status: 'published'
    }),
    AssignmentSubmission.distinct('assignment_id', {
      course_id: normalizedCourseId,
      student_id: normalizedStudentId
    }),
    QuizAttempt.distinct('quiz_id', {
      course_id: normalizedCourseId,
      student_id: normalizedStudentId,
      status: 'submitted'
    })
  ]);

  const totalAssessments = publishedAssignments + publishedQuizzes;
  if (!totalAssessments) return;

  const completedAssessments = submittedAssignmentIds.length + submittedQuizIds.length;
  const progress = Math.max(0, Math.min(100, Math.round((completedAssessments / totalAssessments) * 100)));

  const enrollmentCheckUrl = `${ENROLLMENT_SERVICE_URL}/internal/check?studentId=${encodeURIComponent(normalizedStudentId)}&courseId=${encodeURIComponent(normalizedCourseId)}`;
  const enrollmentCheckResponse = await fetch(enrollmentCheckUrl, {
    method: 'GET'
  });
  const enrollmentCheckPayload = await parseJson(enrollmentCheckResponse);
  const enrollmentId = enrollmentCheckPayload?.data?.enrollment?._id;

  if (!enrollmentId) return;

  await fetch(`${ENROLLMENT_SERVICE_URL}/${enrollmentId}/progress`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(req)
    },
    body: JSON.stringify({ progress })
  }).then(parseJson);
};

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
      status: status || 'published'
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
      status: status || 'published'
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

const getStudentAssignments = async (req, res) => {
  try {
    if (!requireStudentRole(req, res)) return;

    const { courseId } = req.query;
    let allowedCourseIds = [];

    if (courseId) {
      const enrolled = await isStudentEnrolled(req, courseId);
      if (!enrolled) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
      allowedCourseIds = [String(courseId)];
    } else {
      allowedCourseIds = await getStudentEnrolledCourseIds(req);
    }

    if (!allowedCourseIds.length) {
      return res.json({
        success: true,
        data: { assignments: [] }
      });
    }

    const assignments = await Assignment.find({
      course_id: { $in: allowedCourseIds },
      status: 'published'
    }).sort({ dueDate: 1, createdAt: -1 });

    const studentId = getUserId(req.user);
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload: missing student id'
      });
    }

    const assignmentIds = assignments.map((assignment) => String(assignment._id));
    const submissions = assignmentIds.length
      ? await AssignmentSubmission.find({
          assignment_id: { $in: assignmentIds },
          student_id: studentId
        })
      : [];

    const submissionByAssignment = new Map(
      submissions.map((submission) => [submission.assignment_id, submission])
    );

    const enriched = assignments.map((assignment) => {
      const plain = assignment.toObject();
      const submission = submissionByAssignment.get(String(assignment._id));
      return {
        ...plain,
        isSubmitted: Boolean(submission),
        mySubmission: submission || null
      };
    });

    return res.json({
      success: true,
      data: { assignments: enriched }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student assignments',
      error: error.message
    });
  }
};

const getStudentCourseAssignments = async (req, res) => {
  try {
    if (!requireStudentRole(req, res)) return;

    const { courseId } = req.params;
    const enrolled = await isStudentEnrolled(req, courseId);

    if (!enrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    const assignments = await Assignment.find({
      course_id: String(courseId),
      status: 'published'
    }).sort({ dueDate: 1, createdAt: -1 });

    const studentId = getUserId(req.user);
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload: missing student id'
      });
    }

    const assignmentIds = assignments.map((assignment) => String(assignment._id));
    const submissions = assignmentIds.length
      ? await AssignmentSubmission.find({
          assignment_id: { $in: assignmentIds },
          student_id: studentId
        })
      : [];

    const submissionByAssignment = new Map(
      submissions.map((submission) => [submission.assignment_id, submission])
    );

    const enriched = assignments.map((assignment) => {
      const plain = assignment.toObject();
      const submission = submissionByAssignment.get(String(assignment._id));
      return {
        ...plain,
        isSubmitted: Boolean(submission),
        mySubmission: submission || null
      };
    });

    return res.json({
      success: true,
      data: { assignments: enriched }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student course assignments',
      error: error.message
    });
  }
};

const getStudentQuizzes = async (req, res) => {
  try {
    if (!requireStudentRole(req, res)) return;

    const { courseId } = req.query;
    let allowedCourseIds = [];

    if (courseId) {
      const enrolled = await isStudentEnrolled(req, courseId);
      if (!enrolled) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
      allowedCourseIds = [String(courseId)];
    } else {
      allowedCourseIds = await getStudentEnrolledCourseIds(req);
    }

    if (!allowedCourseIds.length) {
      return res.json({
        success: true,
        data: { quizzes: [] }
      });
    }

    const quizzes = await Quiz.find({
      course_id: { $in: allowedCourseIds },
      status: 'published'
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { quizzes }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student quizzes',
      error: error.message
    });
  }
};

const getStudentCourseQuizzes = async (req, res) => {
  try {
    if (!requireStudentRole(req, res)) return;

    const { courseId } = req.params;
    const enrolled = await isStudentEnrolled(req, courseId);

    if (!enrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    const quizzes = await Quiz.find({
      course_id: String(courseId),
      status: 'published'
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { quizzes }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student course quizzes',
      error: error.message
    });
  }
};

const submitStudentQuiz = async (req, res) => {
  try {
    if (!requireStudentRole(req, res)) return;

    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (!quiz || quiz.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const enrolled = await isStudentEnrolled(req, quiz.course_id);
    if (!enrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    const studentId = getUserId(req.user);
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload: missing student id'
      });
    }

    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    if ((quiz.questions || []).length && answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Answers must be provided for every question'
      });
    }

    const normalizedAnswers = (quiz.questions || []).map((_, index) => answers[index]);
    const { score, totalPoints, percentage } = calculateQuizScore(quiz, normalizedAnswers);

    const timeSpent = Number(req.body.timeSpent);
    const startedAt = req.body.startedAt ? new Date(req.body.startedAt) : new Date();

    const attempt = await QuizAttempt.create({
      quiz_id: String(quiz._id),
      course_id: String(quiz.course_id),
      quiz_title: quiz.title,
      student_id: studentId,
      student_name: getUserName(req.user),
      answers: normalizedAnswers,
      score,
      totalPoints,
      percentage,
      timeSpent: Number.isFinite(timeSpent) && timeSpent >= 0 ? timeSpent : 0,
      startedAt: Number.isNaN(startedAt.getTime()) ? new Date() : startedAt,
      submittedAt: new Date(),
      status: 'submitted'
    });

    try {
      await syncEnrollmentProgress(req, quiz.course_id, studentId);
    } catch (progressError) {
      console.error('Failed to sync progress after quiz submission:', progressError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: { attempt }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

const getStudentQuizAttempts = async (req, res) => {
  try {
    if (!requireStudentRole(req, res)) return;

    const studentId = getUserId(req.user);
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload: missing student id'
      });
    }

    const filter = {
      student_id: studentId,
      status: 'submitted'
    };

    if (req.query.courseId) {
      filter.course_id = String(req.query.courseId);
    }

    if (req.query.quizId) {
      filter.quiz_id = String(req.query.quizId);
    }

    const attempts = await QuizAttempt.find(filter).sort({ submittedAt: -1 });

    return res.json({
      success: true,
      data: { attempts }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz attempts',
      error: error.message
    });
  }
};

const submitStudentAssignment = async (req, res) => {
  try {
    if (!requireStudentRole(req, res)) return;

    const { assignmentId } = req.params;
    const studentId = getUserId(req.user);

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload: missing student id'
      });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || assignment.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const enrolled = await isStudentEnrolled(req, assignment.course_id);
    if (!enrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Submission file is required'
      });
    }

    const submission = await AssignmentSubmission.findOneAndUpdate(
      {
        assignment_id: String(assignment._id),
        student_id: studentId
      },
      {
        assignment_id: String(assignment._id),
        course_id: String(assignment.course_id),
        student_id: studentId,
        student_name: getUserName(req.user),
        submissionText: (req.body.submissionText || '').trim(),
        fileUrl: '',
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        fileData: req.file.buffer,
        submittedAt: new Date(),
        status: 'submitted'
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    submission.fileUrl = buildSubmissionFileUrl(submission._id);
    await submission.save();

    let notification = {
      channel: 'email',
      sent: false,
      message: 'Submission saved, but email notification was not sent.'
    };

    try {
      console.info(
        `[Assessment] Email notify attempt: studentId=${studentId}, assignmentId=${assignment._id}, email=${req.user?.email || 'missing'}`
      );

      const mailResult = await sendAssignmentSubmittedEmail({
        to: req.user.email,
        studentName: getUserName(req.user),
        assignmentTitle: assignment.title,
        submittedAt: submission.submittedAt
      });

      console.info(
        `[Assessment] Email notify result: sent=${Boolean(mailResult?.sent)}, messageId=${mailResult?.messageId || 'n/a'}`
      );

      notification = {
        channel: 'email',
        sent: Boolean(mailResult?.sent),
        message: mailResult?.sent
          ? 'Submission saved and confirmation email sent.'
          : `Submission saved, but email notification was not sent (${mailResult?.reason || 'unknown reason'}).`
      };
    } catch (emailError) {
      console.error('Failed to send assignment submission email:', emailError.message);
      notification = {
        channel: 'email',
        sent: false,
        message: `Submission saved, but email notification failed (${emailError.message}).`
      };
    }

    try {
      await syncEnrollmentProgress(req, assignment.course_id, studentId);
    } catch (progressError) {
      console.error('Failed to sync progress after assignment submission:', progressError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        submission: toSubmissionResponse(submission),
        notification
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit assignment',
      error: error.message
    });
  }
};

const getStudentAssignmentSubmissions = async (req, res) => {
  try {
    if (!requireStudentRole(req, res)) return;

    const studentId = getUserId(req.user);
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload: missing student id'
      });
    }

    const { courseId } = req.query;
    let query = { student_id: studentId };

    if (courseId) {
      query.course_id = courseId;
      const enrolled = await isStudentEnrolled(req, courseId);
      if (!enrolled) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
    }

    const submissions = await AssignmentSubmission.find(query).sort({ submittedAt: -1 });

    return res.json({
      success: true,
      data: { submissions: submissions.map(toSubmissionResponse) }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};

const getStudentAssignmentSubmission = async (req, res) => {
  try {
    if (!requireStudentRole(req, res)) return;

    const { assignmentId } = req.params;
    const studentId = getUserId(req.user);

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload: missing student id'
      });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const enrolled = await isStudentEnrolled(req, assignment.course_id);
    if (!enrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    const submission = await AssignmentSubmission.findOne({
      assignment_id: String(assignment._id),
      student_id: studentId
    });

    return res.json({
      success: true,
      data: { submission: toSubmissionResponse(submission) }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch submission',
      error: error.message
    });
  }
};

const downloadSubmissionFile = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await AssignmentSubmission.findById(submissionId).select('+fileData');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const requesterId = getUserId(req.user);
    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload: missing user id'
      });
    }

    const isStudentOwner = req.user.role === 'student' && String(submission.student_id) === requesterId;

    let canTutorAccess = false;
    if (req.user.role === 'tutor' || req.user.role === 'admin') {
      const assignment = await Assignment.findById(submission.assignment_id).select('owner_id');
      if (assignment && canModify(assignment.owner_id, req.user)) {
        canTutorAccess = true;
      }
    }

    if (!isStudentOwner && !canTutorAccess) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to access this file'
      });
    }

    if (!submission.fileData || !submission.fileData.length) {
      return res.status(404).json({
        success: false,
        message: 'Submission file data not found in database'
      });
    }

    const safeName = String(submission.fileName || 'submission.bin').replace(/[\r\n"]/g, '_');
    res.setHeader('Content-Type', submission.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', submission.fileSize || submission.fileData.length);
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    return res.send(submission.fileData);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to download submission file',
      error: error.message
    });
  }
};

const getTutorAssignmentSubmissions = async (req, res) => {
  try {
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors can access this resource'
      });
    }

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
        message: 'Only the course owner can view submissions'
      });
    }

    const submissions = await AssignmentSubmission.find({
      assignment_id: String(assignmentId)
    }).sort({ submittedAt: -1 });

    return res.json({
      success: true,
      data: { submissions: submissions.map(toSubmissionResponse) }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};

const getTutorCourseSubmissions = async (req, res) => {
  try {
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors can access this resource'
      });
    }

    const { courseId } = req.params;
    const assignments = await Assignment.find({ course_id: courseId });

    if (!assignments.length) {
      return res.json({
        success: true,
        data: { submissions: [] }
      });
    }

    const tutorOwned = assignments.filter(a => canModify(a.owner_id, req.user));
    if (!tutorOwned.length) {
      return res.status(403).json({
        success: false,
        message: 'You do not own any assignments in this course'
      });
    }

    const assignmentIds = tutorOwned.map(a => String(a._id));
    const submissions = await AssignmentSubmission.find({
      assignment_id: { $in: assignmentIds }
    }).sort({ submittedAt: -1 });

    return res.json({
      success: true,
      data: { submissions: submissions.map(toSubmissionResponse) }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course submissions',
      error: error.message
    });
  }
};

const getTutorQuizAttempts = async (req, res) => {
  try {
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors can access this resource'
      });
    }

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
        message: 'Only the quiz owner can view attempts'
      });
    }

    const attempts = await QuizAttempt.find({
      quiz_id: String(quizId),
      status: 'submitted'
    }).sort({ submittedAt: -1 });

    return res.json({
      success: true,
      data: { attempts }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz attempts',
      error: error.message
    });
  }
};

const getTutorCourseQuizAttempts = async (req, res) => {
  try {
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors can access this resource'
      });
    }

    const { courseId } = req.params;
    const quizzes = await Quiz.find({ course_id: courseId });

    if (!quizzes.length) {
      return res.json({
        success: true,
        data: { attempts: [] }
      });
    }

    const tutorOwned = quizzes.filter(q => canModify(q.owner_id, req.user));
    if (!tutorOwned.length) {
      return res.status(403).json({
        success: false,
        message: 'You do not own any quizzes in this course'
      });
    }

    const quizIds = tutorOwned.map(q => String(q._id));
    const attempts = await QuizAttempt.find({
      quiz_id: { $in: quizIds },
      status: 'submitted'
    }).sort({ submittedAt: -1 });

    return res.json({
      success: true,
      data: { attempts }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch course quiz attempts',
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
  deleteQuiz,
  getStudentAssignments,
  getStudentCourseAssignments,
  getStudentQuizzes,
  getStudentCourseQuizzes,
  submitStudentQuiz,
  getStudentQuizAttempts,
  submitStudentAssignment,
  getStudentAssignmentSubmission,
  getStudentAssignmentSubmissions,
  downloadSubmissionFile,
  getTutorAssignmentSubmissions,
  getTutorCourseSubmissions,
  getTutorQuizAttempts,
  getTutorCourseQuizAttempts
};
