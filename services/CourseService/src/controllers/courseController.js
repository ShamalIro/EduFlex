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
    const { 
      title, description, thumbnail, 
      category, level, duration, 
      price, is_free 
    } = req.body;
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

    const course = new Course({
      title,
      description,
      thumbnail,
      category,
      level,
      duration,
      price: is_free ? 0 : price,
      is_free: is_free || false,
      tutor_id: tutorId,
      tutor_name: resolveTutorName(req.user)
    });

    await course.save();
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

// Get admin statistics
const getAdminStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const published = await Course.countDocuments({ is_published: true });
    const byCategory = await Course.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ totalCourses, published, byCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add lesson to course (tutor only)
const addLesson = async (req, res) => {
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
        message: 'Not authorized to add lessons to this course'
      });
    }

    const lessonData = {
      ...req.body,
      pdfUrl: req.file ? `/uploads/${req.file.filename}` : null
    };
    course.lessons.push(lessonData);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Add lesson error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add lesson',
      error: error.message
    });
  }
};

// Update lesson
const updateLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    Object.assign(lesson, req.body);
    await course.save();
    res.json({ success: true, course });
  } catch (error) {
    console.error('Update lesson error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update lesson', error: error.message });
  }
};

// Delete lesson
const deleteLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    course.lessons.pull(req.params.lessonId);
    await course.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete lesson error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete lesson', error: error.message });
  }
};

// Increment students count
const incrementStudents = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $inc: { students_count: 1 } },
      { new: true }
    );
    return res.json({ success: true, data: { course } });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Set students count directly
const setStudentsCount = async (req, res) => {
  try {
    const { count } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: { students_count: count } },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    console.log(`Set students_count=${count} for course ${req.params.id}`);
    return res.json({ success: true, data: { course } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
  setStudentsCount
};