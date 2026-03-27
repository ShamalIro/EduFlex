const Course = require('../models/courseModel');

const resolveTutorId = (user = {}) => {
  const raw = user.id ?? user.user_id ?? user.sub;
  return raw !== undefined && raw !== null ? String(raw) : null;
};

const resolveTutorName = (user = {}) => {
  const first = user.first_name || user.firstName || '';
  const last = user.last_name || user.lastName || '';
  const full = `${first} ${last}`.trim();
  if (full) return full;
  if (user.email && typeof user.email === 'string') {
    return user.email.split('@')[0];
  }
  return 'Tutor';
};

// Create course (tutor only)
const createCourse = async (req, res) => {
  try {
    const { title, description, category, level, duration, price, thumbnail } = req.body;
    const tutorId = resolveTutorId(req.user);

    if (!title || !description || !category || !level || !duration) {
      return res.status(400).json({
        success: false,
        message: 'title, description, category, level and duration are required'
      });
    }

    if (!tutorId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload: missing tutor id'
      });
    }

    const course = await Course.create({
      title,
      description,
      category,
      level,
      duration,
      price: price || 0,
      thumbnail: thumbnail || null,
      tutor_id: tutorId,
      tutor_name: resolveTutorName(req.user)
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Create course error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
};

// Get all published courses (public)
const getAllCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    const filter = { is_published: true };

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const courses = await Course.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('Get courses error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
};

// Get single course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    console.error('Get course error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    });
  }
};

// Get tutor's own courses
const getMyCourses = async (req, res) => {
  try {
    const tutorId = resolveTutorId(req.user);
    if (!tutorId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload: missing tutor id'
      });
    }

    const courses = await Course.find({ tutor_id: tutorId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('Get my courses error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
};

// Update course (tutor only)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const requesterId = resolveTutorId(req.user);

    if (String(course.tutor_id) !== String(requesterId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course: updatedCourse }
    });
  } catch (error) {
    console.error('Update course error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
};

// Delete course (tutor/admin only)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const requesterId = resolveTutorId(req.user);

    if (String(course.tutor_id) !== String(requesterId) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
};

// Publish/Unpublish course
const togglePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.is_published = !course.is_published;
    await course.save();

    res.json({
      success: true,
      message: `Course ${course.is_published ? 'published' : 'unpublished'} successfully`,
      data: { course }
    });
  } catch (error) {
    console.error('Toggle publish error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  deleteCourse,
  togglePublish
};