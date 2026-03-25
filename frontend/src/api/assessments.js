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
  await new Promise((resolve) => setTimeout(resolve, 800));
  return MOCK_QUIZ;
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

const extractList = (responseData, key) => {
  const scoped = responseData?.data?.[key];
  if (Array.isArray(scoped)) return scoped;
  const direct = responseData?.[key];
  if (Array.isArray(direct)) return direct;
  return [];
};

const extractItem = (responseData, key) => {
  const scoped = responseData?.data?.[key];
  if (scoped) return scoped;
  const direct = responseData?.[key];
  if (direct) return direct;
  return null;
};

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
