const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const axios = require('axios'); // ✅ Added
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = Number(process.env.PORT) || 4004;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eduflex_enrollments';

const enrollmentSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, index: true },
    course_id: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },
    progress: { type: Number, default: 0, min: 0, max: 100 }
  },
  { timestamps: true }
);

enrollmentSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Enrollment Service',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Enrollment Service is running' });
});

app.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only students can enroll in courses'
      });
    }

    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'courseId is required'
      });
    }

    const existing = await Enrollment.findOne({
      student_id: String(req.user.id),
      course_id: String(courseId)
    });

    if (existing) {
      return res.json({
        success: true,
        message: 'Already enrolled in this course',
        data: { enrollment: existing }
      });
    }

    const enrollment = await Enrollment.create({
      student_id: String(req.user.id),
      course_id: String(courseId),
      status: 'active'
    });

    // ✅ Added - Send enrollment notification
    try {
      await axios.post('http://localhost:4006/api/notifications', {
        user_id: String(req.user.id),
        title: '🎉 Enrollment Successful!',
        message: 'You have successfully enrolled in a new course. Start learning now!',
        type: 'enrollment',
        icon: '🎓'
      });
      console.log(`✅ Notification sent to user ${req.user.id}`);
    } catch (notifError) {
      console.error('Notification error:', notifError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: { enrollment }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create enrollment',
      error: error.message
    });
  }
});

app.get('/mine', authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student_id: String(req.user.id),
      status: { $ne: 'cancelled' }
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { enrollments }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: error.message
    });
  }
});

app.get('/my-course-ids', authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.find(
      {
        student_id: String(req.user.id),
        status: { $ne: 'cancelled' }
      },
      { course_id: 1 }
    );

    const courseIds = enrollments.map((item) => String(item.course_id));

    return res.json({
      success: true,
      data: { courseIds }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled course ids',
      error: error.message
    });
  }
});

app.get('/course/:courseId/status', authMiddleware, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student_id: String(req.user.id),
      course_id: String(req.params.courseId),
      status: { $ne: 'cancelled' }
    });

    return res.json({
      success: true,
      data: {
        isEnrolled: Boolean(enrollment),
        enrollment
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment status',
      error: error.message
    });
  }
});

// Internal endpoint for service-to-service enrollment checks.
app.get('/internal/check', async (req, res) => {
  try {
    const { studentId, courseId } = req.query;
    if (!studentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'studentId and courseId are required'
      });
    }

    const enrollment = await Enrollment.findOne({
      student_id: String(studentId),
      course_id: String(courseId),
      status: { $ne: 'cancelled' }
    });

    return res.json({
      success: true,
      data: {
        isEnrolled: Boolean(enrollment),
        enrollment
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to validate enrollment',
      error: error.message
    });
  }
});

app.patch('/:enrollmentId/progress', authMiddleware, async (req, res) => {
  try {
    const { progress } = req.body;
    if (progress === undefined) {
      return res.status(400).json({
        success: false,
        message: 'progress is required'
      });
    }

    const enrollment = await Enrollment.findById(req.params.enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (
      req.user.role !== 'admin' &&
      String(enrollment.student_id) !== String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this enrollment'
      });
    }

    enrollment.progress = Number(progress);
    if (enrollment.progress >= 100) {
      enrollment.status = 'completed';
    }
    await enrollment.save();

    return res.json({
      success: true,
      message: 'Enrollment progress updated',
      data: { enrollment }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update enrollment progress',
      error: error.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Enrollment Service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
});