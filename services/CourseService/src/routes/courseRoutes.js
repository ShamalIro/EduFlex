const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  deleteCourse,
  togglePublish,
  getAdminStats
} = require('../controllers/courseController');
const { authMiddleware, isTutor } = require('../middleware/authMiddleware');

// Public routes
router.get('/health/check', (req, res) => {
  res.json({ status: 'OK', message: 'Course Service routes working' });
});
router.get('/', getAllCourses);

// Protected routes (specific before dynamic!)
router.post('/', authMiddleware, isTutor, createCourse);
router.get('/tutor/my-courses', authMiddleware, isTutor, getMyCourses);
router.get('/admin/stats', getAdminStats);

// Dynamic routes (always last!)
router.get('/:id', getCourseById);
router.put('/:id', authMiddleware, isTutor, updateCourse);
router.delete('/:id', authMiddleware, isTutor, deleteCourse);
router.patch('/:id/publish', authMiddleware, isTutor, togglePublish);

module.exports = router;