const express = require('express');
const {
  getCourseAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getCourseQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz
} = require('../controllers/assessmentController');
const { authMiddleware, isTutor } = require('../middleware/authMiddleware');

const router = express.Router();

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

module.exports = router;
