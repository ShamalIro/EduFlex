const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const {
  createCourse,
  getAllCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  deleteCourse,
  togglePublish,
  getAdminStats,
  addLesson,
  updateLesson,
  deleteLesson,
  incrementStudents,
  setStudentsCount,
  addReview,
  getReviews
} = require('../controllers/courseController');

const { authMiddleware, isTutor } = require('../middleware/authMiddleware');

// Public routes
router.get('/health/check', (req, res) => {
  res.json({ status: 'OK', message: 'Course Service routes working' });
});

router.get('/', getAllCourses);

// Protected routes
router.post('/', authMiddleware, isTutor, createCourse);
router.get('/tutor/my-courses', authMiddleware, isTutor, getMyCourses);
router.get('/admin/stats', getAdminStats);

// Reviews
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', authMiddleware, addReview);

// Student count
router.patch('/:id/increment-students', incrementStudents);
router.post('/:id/set-students', setStudentsCount);

// Lessons
router.post('/:id/lessons', authMiddleware, isTutor, upload.single('pdf'), addLesson);
router.put('/:id/lessons/:lessonId', authMiddleware, isTutor, updateLesson);
router.delete('/:id/lessons/:lessonId', authMiddleware, isTutor, deleteLesson);

// Course dynamic routes
router.get('/:id', getCourseById);
router.put('/:id', authMiddleware, isTutor, updateCourse);
router.delete('/:id', authMiddleware, isTutor, deleteCourse);
router.patch('/:id/publish', authMiddleware, isTutor, togglePublish);

module.exports = router;