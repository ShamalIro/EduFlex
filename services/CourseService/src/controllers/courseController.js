const Course = require('../models/courseModel');

// Create course (tutor only)
const createCourse = async (req, res) => {
  try {
    const { title, description, category, level, duration, price, thumbnail } = req.body;

    if (!title || !description || !category || !level || !duration) {
      return res.status(400).json({
        success: false,
        message: 'title, description, category, level and duration are required'
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
      tutor_id: req.user.id,
      tutor_name: req.user.first_name || 'Tutor'
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
    const tutorId = req.user.id;
    const numericTutorId = Number(tutorId);
    const tutorFilters = [{ tutor_id: tutorId }];

    if (!Number.isNaN(numericTutorId)) {
      tutorFilters.push({ tutor_id: numericTutorId });
    }

    const courses = await Course.find({ $or: tutorFilters }).sort({ createdAt: -1 });

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

    if (String(course.tutor_id) !== String(req.user.id) && req.user.role !== 'admin') {
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

    if (String(course.tutor_id) !== String(req.user.id) && req.user.role !== 'admin') {
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