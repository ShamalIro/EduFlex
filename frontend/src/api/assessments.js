import courseClient from './courseClient';

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
 * @param {{ answers: any[]; timeSpent?: number; startedAt?: string }} payload
 * @returns {Promise<import('../types').QuizResult>}
 */
export const submitQuiz = async (quizId, payload) => {
  const response = await courseClient.post(`/assignments/student/quizzes/${quizId}/submit`, {
    answers: payload?.answers,
    timeSpent: payload?.timeSpent,
    startedAt: payload?.startedAt
  });

  return extractItem(response.data, 'attempt') || response.data;
};

/**
 * @param {{ courseId?: string }} [filters]
 * @returns {Promise<import('../types').QuizResult[]>}
 */
export const getResults = async (filters = {}) => {
  const response = await courseClient.get('/assignments/student/quiz-attempts', {
    params: filters.courseId ? { courseId: filters.courseId } : undefined
  });
  return extractList(response.data, 'attempts');
};

export const getAssignmentSubmissions = async (filters = {}) => {
  const response = await courseClient.get('/assignments/student/assignment-submissions', {
    params: filters.courseId ? { courseId: filters.courseId } : undefined
  });
  return extractList(response.data, 'submissions');
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

  return {
    submission: extractItem(response.data, 'submission'),
    notification: extractItem(response.data, 'notification'),
    message: response?.data?.message || 'Assignment submitted successfully'
  };
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

export const downloadAssignmentSubmissionFile = async (submissionId, fileName = 'submission.bin') => {
  const response = await courseClient.get(`/assignments/submissions/${submissionId}/file`, {
    responseType: 'blob'
  });

  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
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
