const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = Number(process.env.PORT) || 4004;
const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/eduflex_enrollments';
const MONGO_URI = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

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
    if (MONGO_URI !== DEFAULT_MONGO_URI) {
      console.warn(`Primary MongoDB URI failed: ${error.message}`);
      console.warn(`Falling back to local MongoDB: ${DEFAULT_MONGO_URI}`);
      try {
        const fallbackConn = await mongoose.connect(DEFAULT_MONGO_URI);
        console.log(`MongoDB Connected: ${fallbackConn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error(`MongoDB fallback failed: ${fallbackError.message}`);
        process.exit(1);
      }
    }

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

// AI Course Recommendations
app.post('/recommendations', authMiddleware, async (req, res) => {
  try {
    const { enrolledCourses, learningGoal } = req.body;

    // Fetch all available courses
    let allCourses = [];
    try {
      const coursesRes = await axios.get(`${process.env.COURSE_SERVICE_URL}/`);
      allCourses = coursesRes.data?.data?.courses || [];
    } catch (courseErr) {
      console.error('Course fetch failed:', courseErr.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch courses'
      });
    }

    // Filter out enrolled courses
    const enrolledIds = (enrolledCourses || []).map(c =>
      String(c._id || c.id || c.course_id)
    );
    const availableCourses = allCourses.filter(
      c => !enrolledIds.includes(String(c._id))
    );

    if (availableCourses.length === 0) {
      return res.json({ success: true, data: { recommendations: [] } });
    }

    // Build course list for prompt
    const availableSummary = availableCourses
      .map((c, i) => 
        `${i}. ${c.title} | ${c.category} | ${c.level} | ${c.description?.substring(0, 60) || ''}`
      )
      .join('\n');

    // Build prompt based on learningGoal or enrolled courses
    const prompt = learningGoal
      ? `
You are a course recommendation AI for EduFlex LMS.

Student wants to learn: "${learningGoal}"

Available courses (index. title | category | level | description):
${availableSummary}

Based on what the student wants to learn, recommend exactly 3 most relevant courses.
Respond ONLY with a JSON array of 3 indices. Example: [0, 3, 7]
No explanation, no markdown, just the JSON array.
`
      : `
You are a course recommendation AI for EduFlex LMS.

Student is enrolled in: ${(enrolledCourses || []).map(c => c.title).join(', ')}

Available courses (index. title | category | level | description):
${availableSummary}

Recommend exactly 3 courses that match student learning path.
Respond ONLY with JSON array of 3 indices. Example: [0, 3, 7]
No explanation, no markdown, just the JSON array.
`;

    // Call Gemini API
    let indices = [0, 1, 2]; // default fallback
    try {
      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] }
      );

      const rawText = geminiRes.data?.candidates?.[0]
        ?.content?.parts?.[0]?.text || '[]';

      const cleanText = rawText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      try {
        indices = JSON.parse(cleanText);
        console.log('AI indices:', indices);
      } catch {
        console.log('Parse failed, using fallback');
        indices = [0, 1, 2];
      }
    } catch (geminiErr) {
      console.error('Gemini failed:', geminiErr.message);

      let fallbackCourses;

      if (learningGoal) {
        // Extract individual keywords from the learning goal
        const keywords = learningGoal.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '') // remove special chars
          .split(' ')
          .filter(word => word.length > 2) // ignore short words like "i", "to"
          .filter(word => !['want', 'learn', 'lean', 'need', 
            'know', 'study', 'about', 'with', 'and', 'the', 
            'for', 'how'].includes(word)); // ignore common words

        console.log('Search keywords:', keywords);

        const matched = availableCourses.filter(c => {
          const searchText = [
            c.title,
            c.description,
            c.category,
            c.level
          ].join(' ').toLowerCase();

          // Match if ANY keyword found
          return keywords.some(keyword => searchText.includes(keyword));
        });

        console.log('Matched courses:', matched.map(c => c.title));

        fallbackCourses = matched.length > 0
          ? matched.slice(0, 3)
          : availableCourses.sort(() => Math.random() - 0.5).slice(0, 3);
      } else {
        fallbackCourses = [...availableCourses]
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
      }

      return res.json({
        success: true,
        data: { recommendations: fallbackCourses }
      });
    }

    // Shuffle available courses for variety
    const shuffledAvailable = [...availableCourses]
      .sort(() => Math.random() - 0.5);

    const recommendations = indices
      .filter(i => i >= 0 && i < availableCourses.length)
      .map(i => availableCourses[i])
      .slice(0, 3);

    console.log('Recommendations:', recommendations.map(r => r.title));

    return res.json({
      success: true,
      data: { recommendations }
    });

  } catch (error) {
    console.error('Recommendations error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// Get all student IDs enrolled in a course (internal use)
app.get('/course/:courseId/students', async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      course_id: String(req.params.courseId),
      status: { $ne: 'cancelled' }
    }, { student_id: 1 });

    const studentIds = enrollments.map(e => String(e.student_id));

    return res.json({
      success: true,
      data: { studentIds }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled students',
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