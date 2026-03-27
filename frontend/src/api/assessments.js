import courseClient from './courseClient';

const MOCK_QUIZ = {
  id: 'q1',
  courseId: '1',
  title: 'React Fundamentals Quiz',
  timeLimit: 15,
  totalPoints: 50,
  questions: [
    {
      id: '1',
      text: 'What is the virtual DOM?',
      options: [
        'A direct copy of the real DOM',
        'A lightweight JavaScript representation of the DOM',
        'A browser plugin for debugging',
        'A database for storing HTML'
      ],
      correctAnswer: 1
    },
    {
      id: '2',
      text: 'Which hook is used for side effects?',
      options: ['useState', 'useContext', 'useEffect', 'useReducer'],
      correctAnswer: 2
    },
    {
      id: '3',
      text: 'How do you pass data to a child component?',
      options: ['State', 'Props', 'Context', 'Redux'],
      correctAnswer: 1
    },
    {
      id: '4',
      text: 'What is the correct way to update state?',
      options: [
        'this.state.value = 5',
        'setState({ value: 5 })',
        'state = 5',
        'updateState(5)'
      ],
      correctAnswer: 1
    },
    {
      id: '5',
      text: 'What does JSX stand for?',
      options: [
        'JavaScript XML',
        'Java Syntax Extension',
        'JSON XML',
        'JavaScript Extension'
      ],
      correctAnswer: 0
    }
  ]
};

/**
 * @param {string} courseId
 * @returns {Promise<import('../types').Quiz>}
 */
export const getQuizByCourse = async (courseId) => {
  const response = await courseClient.get(`/assignments/student/courses/${courseId}/quizzes`);
  const quizzes = extractList(response.data, 'quizzes');
  if (!quizzes.length) {
    return null;
  }

  const quiz = quizzes[0];
  return {
    id: quiz._id || quiz.id,
    courseId: quiz.course_id,
    title: quiz.title,
    timeLimit: quiz.timeLimit || 15,
    totalPoints: quiz.totalPoints || 50,
    questions: (quiz.questions || []).map((question, index) => {
      const options = (question.options || []).map((option) => option.text);
      const correctAnswer = (question.options || []).findIndex((option) => option.isCorrect);

      if (options.length > 1) {
        return {
          id: question._id || question.id || String(index + 1),
          text: question.text,
          options,
          correctAnswer: correctAnswer >= 0 ? correctAnswer : 0
        };
      }

      return {
        id: question._id || question.id || String(index + 1),
        text: question.text,
        options: ['True', 'False'],
        correctAnswer: 0
      };
    })
  };
};

/**
 * @param {string} quizId
 * @param {number[]} answers
 * @returns {Promise<import('../types').QuizResult>}
 */
export const submitQuiz = async (quizId, answers) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Calculate score
  let score = 0;
  const pointsPerQuestion = MOCK_QUIZ.totalPoints / MOCK_QUIZ.questions.length;

  MOCK_QUIZ.questions.forEach((q, idx) => {
    if (answers[idx] === q.correctAnswer) {
      score += pointsPerQuestion;
    }
  });

  return {
    id: `res-${Date.now()}`,
    quizId,
    studentId: '1',
    score,
    totalPoints: MOCK_QUIZ.totalPoints,
    completedAt: new Date().toISOString(),
    answers
  };
};

/**
 * @returns {Promise<import('../types').QuizResult[]>}
 */
export const getResults = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [
    {
      id: 'r1',
      quizId: 'q1',
      studentId: '1',
      score: 40,
      totalPoints: 50,
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      answers: [1, 2, 1, 1, 0]
    }
  ];
};

function extractList(responseData, key) {
  const scoped = responseData?.data?.[key];
  if (Array.isArray(scoped)) return scoped;
  const direct = responseData?.[key];
  if (Array.isArray(direct)) return direct;
  return [];
}

function extractItem(responseData, key) {
  const scoped = responseData?.data?.[key];
  if (scoped) return scoped;
  const direct = responseData?.[key];
  if (direct) return direct;
  return null;
}

// Tutor Assignment CRUD
export const getCourseAssignments = async (courseId) => {
  try {
    const response = await courseClient.get(`/assignments/courses/${courseId}/assignments`);
    return extractList(response.data, 'assignments');
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};

export const createCourseAssignment = async (courseId, payload) => {
  const response = await courseClient.post(`/assignments/courses/${courseId}/assignments`, payload);
  return extractItem(response.data, 'assignment') || response.data;
};

export const updateCourseAssignment = async (assignmentId, payload) => {
  const response = await courseClient.put(`/assignments/assignments/${assignmentId}`, payload);
  return extractItem(response.data, 'assignment') || response.data;
};

export const deleteCourseAssignment = async (assignmentId) => {
  await courseClient.delete(`/assignments/assignments/${assignmentId}`);
};

// Tutor Quiz CRUD
export const getCourseQuizzes = async (courseId) => {
  try {
    const response = await courseClient.get(`/assignments/courses/${courseId}/quizzes`);
    return extractList(response.data, 'quizzes');
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};

export const createCourseQuiz = async (courseId, payload) => {
  const response = await courseClient.post(`/assignments/courses/${courseId}/quizzes`, payload);
  return extractItem(response.data, 'quiz') || response.data;
};

export const updateCourseQuiz = async (quizId, payload) => {
  const response = await courseClient.put(`/assignments/quizzes/${quizId}`, payload);
  return extractItem(response.data, 'quiz') || response.data;
};

export const deleteCourseQuiz = async (quizId) => {
  await courseClient.delete(`/assignments/quizzes/${quizId}`);
};

export const getMyAssignments = async (courseId) => {
  const response = await courseClient.get('/assignments/student/assignments', {
    params: courseId ? { courseId } : undefined
  });
  return extractList(response.data, 'assignments');
};

export const submitAssignment = async (assignmentId, payload) => {
  const formData = new FormData();
  if (payload?.file) {
    formData.append('file', payload.file);
  }
  if (payload?.submissionText) {
    formData.append('submissionText', payload.submissionText);
  }

  const response = await courseClient.post(
    `/assignments/student/assignments/${assignmentId}/submit`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return extractItem(response.data, 'submission');
};

export const getMyAssignmentSubmission = async (assignmentId) => {
  const response = await courseClient.get(
    `/assignments/student/assignments/${assignmentId}/submission`
  );
  return extractItem(response.data, 'submission');
};

export const getMyQuizzes = async (courseId) => {
  const response = await courseClient.get('/assignments/student/quizzes', {
    params: courseId ? { courseId } : undefined
  });
  return extractList(response.data, 'quizzes');
};

// Tutor submission/attempt viewing
export const getTutorAssignmentSubmissions = async (assignmentId) => {
  try {
    const response = await courseClient.get(`/assignments/tutor/assignments/${assignmentId}/submissions`);
    return extractList(response.data, 'submissions');
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};

export const getTutorCourseSubmissions = async (courseId) => {
  try {
    const response = await courseClient.get(`/assignments/tutor/courses/${courseId}/submissions`);
    return extractList(response.data, 'submissions');
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};

export const getTutorQuizAttempts = async (quizId) => {
  try {
    const response = await courseClient.get(`/assignments/tutor/quizzes/${quizId}/attempts`);
    return extractList(response.data, 'attempts');
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};

export const getTutorCourseQuizAttempts = async (courseId) => {
  try {
    const response = await courseClient.get(`/assignments/tutor/courses/${courseId}/quiz-attempts`);
    return extractList(response.data, 'attempts');
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};
