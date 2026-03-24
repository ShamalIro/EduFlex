/**
 * LocalStorage Service for EduFlex LMS
 * Manages student enrollments, progress, and submissions using localStorage
 */

const STORAGE_KEYS = {
  ENROLLMENTS: 'eduflex_enrollments',
  PROGRESS: 'eduflex_progress',
  QUIZ_RESULTS: 'eduflex_quiz_results',
  ASSIGNMENT_SUBMISSIONS: 'eduflex_submissions'
};

// ============= ENROLLMENTS =============

/**
 * Get all enrollments for current user
 */
export const getEnrollments = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
  return data ? JSON.parse(data) : [];
};

/**
 * Check if user is enrolled in a course
 */
export const isEnrolled = (courseId) => {
  const enrollments = getEnrollments();
  return enrollments.some(e => e.courseId === courseId);
};

/**
 * Enroll in a course
 */
export const enrollInCourse = (courseId) => {
  const enrollments = getEnrollments();

  // Check if already enrolled
  if (enrollments.some(e => e.courseId === courseId)) {
    return { success: false, message: 'Already enrolled' };
  }

  // Add new enrollment
  enrollments.push({
    courseId,
    enrolledAt: new Date().toISOString(),
    progress: 0,
    completedLessons: []
  });

  localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
  return { success: true, message: 'Enrollment successful' };
};

/**
 * Unenroll from a course
 */
export const unenrollFromCourse = (courseId) => {
  const enrollments = getEnrollments();
  const filtered = enrollments.filter(e => e.courseId !== courseId);
  localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(filtered));
  return { success: true, message: 'Unenrolled successfully' };
};

/**
 * Get enrollment details for a specific course
 */
export const getEnrollmentDetails = (courseId) => {
  const enrollments = getEnrollments();
  return enrollments.find(e => e.courseId === courseId) || null;
};

// ============= PROGRESS =============

/**
 * Update course progress
 */
export const updateCourseProgress = (courseId, progress) => {
  const enrollments = getEnrollments();
  const enrollment = enrollments.find(e => e.courseId === courseId);

  if (enrollment) {
    enrollment.progress = progress;
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
    return { success: true };
  }

  return { success: false, message: 'Not enrolled in this course' };
};

/**
 * Mark lesson as completed
 */
export const completeLesson = (courseId, lessonId) => {
  const enrollments = getEnrollments();
  const enrollment = enrollments.find(e => e.courseId === courseId);

  if (enrollment) {
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
    return { success: true };
  }

  return { success: false, message: 'Not enrolled in this course' };
};

// ============= QUIZ RESULTS =============

/**
 * Save quiz result
 */
export const saveQuizResult = (quizId, courseId, result) => {
  const results = getQuizResults();
  results.push({
    id: `result-${Date.now()}`,
    quizId,
    courseId,
    score: result.score,
    totalPoints: result.totalPoints,
    percentage: result.percentage,
    completedAt: new Date().toISOString(),
    timeSpent: result.timeSpent,
    answers: result.answers
  });
  localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(results));
  return { success: true };
};

/**
 * Get all quiz results
 */
export const getQuizResults = () => {
  const data = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
  return data ? JSON.parse(data) : [];
};

/**
 * Get quiz results for a specific course
 */
export const getQuizResultsByCourse = (courseId) => {
  const results = getQuizResults();
  return results.filter(r => r.courseId === courseId);
};

// ============= ASSIGNMENT SUBMISSIONS =============

/**
 * Submit assignment
 */
export const submitAssignment = (assignmentId, courseId, submission) => {
  const submissions = getAssignmentSubmissions();
  submissions.push({
    id: `sub-${Date.now()}`,
    assignmentId,
    courseId,
    submittedAt: new Date().toISOString(),
    file: submission.file,
    status: 'submitted',
    marks: null,
    feedback: null
  });
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, JSON.stringify(submissions));
  return { success: true };
};

/**
 * Get all assignment submissions
 */
export const getAssignmentSubmissions = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS);
  return data ? JSON.parse(data) : [];
};

/**
 * Get submission for a specific assignment
 */
export const getSubmissionByAssignment = (assignmentId) => {
  const submissions = getAssignmentSubmissions();
  return submissions.find(s => s.assignmentId === assignmentId) || null;
};

/**
 * Check if assignment is submitted
 */
export const isAssignmentSubmitted = (assignmentId) => {
  return getSubmissionByAssignment(assignmentId) !== null;
};

// ============= UTILITY =============

/**
 * Clear all data (for testing)
 */
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  return { success: true, message: 'All data cleared' };
};

/**
 * Export all data (for backup)
 */
export const exportData = () => {
  const data = {};
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    const value = localStorage.getItem(storageKey);
    data[key] = value ? JSON.parse(value) : null;
  });
  return data;
};

export default {
  getEnrollments,
  isEnrolled,
  enrollInCourse,
  unenrollFromCourse,
  getEnrollmentDetails,
  updateCourseProgress,
  completeLesson,
  saveQuizResult,
  getQuizResults,
  getQuizResultsByCourse,
  submitAssignment,
  getAssignmentSubmissions,
  getSubmissionByAssignment,
  isAssignmentSubmitted,
  clearAllData,
  exportData
};
