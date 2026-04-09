const express = require('express');
const multer = require('multer');
const {
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
} = require('../controllers/assessmentController');
const { authMiddleware, isTutor } = require('../middleware/authMiddleware');

const router = express.Router();

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
  'image/gif'
]);

const uploadSubmission = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Unsupported file type'));
  }
});

router.get('/health/check', (req, res) => {
  res.json({ status: 'OK', message: 'Assessment routes working' });
});

router.get('/courses/:courseId/assignments', authMiddleware, isTutor, getCourseAssignments);
router.post('/courses/:courseId/assignments', authMiddleware, isTutor, createAssignment);
router.put('/assignments/:assignmentId', authMiddleware, isTutor, updateAssignment);
router.delete('/assignments/:assignmentId', authMiddleware, isTutor, deleteAssignment);

router.get('/courses/:courseId/quizzes', authMiddleware, isTutor, getCourseQuizzes);
router.post('/courses/:courseId/quizzes', authMiddleware, isTutor, createQuiz);
router.put('/quizzes/:quizId', authMiddleware, isTutor, updateQuiz);
router.delete('/quizzes/:quizId', authMiddleware, isTutor, deleteQuiz);

router.get('/student/assignments', authMiddleware, getStudentAssignments);
router.get('/student/quizzes', authMiddleware, getStudentQuizzes);
router.get('/student/courses/:courseId/assignments', authMiddleware, getStudentCourseAssignments);
router.get('/student/courses/:courseId/quizzes', authMiddleware, getStudentCourseQuizzes);
router.get('/student/assignments/:assignmentId/submission', authMiddleware, getStudentAssignmentSubmission);
router.get('/student/assignment-submissions', authMiddleware, getStudentAssignmentSubmissions);
router.post('/student/assignments/:assignmentId/submit', authMiddleware, uploadSubmission.single('file'), submitStudentAssignment);
router.get('/submissions/:submissionId/file', authMiddleware, downloadSubmissionFile);
router.post('/student/quizzes/:quizId/submit', authMiddleware, submitStudentQuiz);
router.get('/student/quiz-attempts', authMiddleware, getStudentQuizAttempts);

// Tutor submission/attempt viewing routes
router.get('/tutor/assignments/:assignmentId/submissions', authMiddleware, isTutor, getTutorAssignmentSubmissions);
router.get('/tutor/courses/:courseId/submissions', authMiddleware, isTutor, getTutorCourseSubmissions);
router.get('/tutor/quizzes/:quizId/attempts', authMiddleware, isTutor, getTutorQuizAttempts);
router.get('/tutor/courses/:courseId/quiz-attempts', authMiddleware, isTutor, getTutorCourseQuizAttempts);

module.exports = router;
