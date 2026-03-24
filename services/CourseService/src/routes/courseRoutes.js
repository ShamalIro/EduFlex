const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  deleteCourse,
  togglePublish
} = require('../controllers/courseController');
const { authMiddleware, isTutor } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected routes (tutor only)
router.post('/', authMiddleware, isTutor, createCourse);
router.get('/tutor/my-courses', authMiddleware, isTutor, getMyCourses);
router.put('/:id', authMiddleware, isTutor, updateCourse);
router.delete('/:id', authMiddleware, isTutor, deleteCourse);
router.patch('/:id/publish', authMiddleware, isTutor, togglePublish);

// Health check
router.get('/health/check', (req, res) => {
  res.json({ status: 'OK', message: 'Course Service routes working' });
});

module.exports = router;