const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
<<<<<<< HEAD
const { createProxyMiddleware } = require('http-proxy-middleware');
=======
const connectDB = require('./config/database');
>>>>>>> 72cd511b6e0ba281a8796f1333200b1acc03fbf8
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
<<<<<<< HEAD
// Do not parse bodies in the gateway; proxied services need the raw request stream.
=======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
>>>>>>> 72cd511b6e0ba281a8796f1333200b1acc03fbf8


// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'API Gateway',
    timestamp: new Date().toISOString() 
  });
});

// Proxy routes
app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/api/users' },
  on: {
    error: (err, req, res) => {
      console.error('User service proxy error:', err);
      res.status(503).json({ error: 'User service unavailable' });
    }
  }
}));

app.use('/api/courses', createProxyMiddleware({
  target: process.env.COURSE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/courses': '' },
  on: {
    error: (err, req, res) => {
      console.error('Course service proxy error:', err);
      res.status(503).json({ error: 'Course service unavailable' });
    }
  }
}));

app.use('/api/assignments', createProxyMiddleware({
  target: process.env.ASSIGNMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/assignments': '' },
  on: {
    error: (err, req, res) => {
      console.error('Assignment service proxy error:', err);
      res.status(503).json({ error: 'Assignment service unavailable' });
    }
  }
}));

app.use('/api/enrollments', createProxyMiddleware({
  target: process.env.ENROLLMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/enrollments': ''
  },
  on: {
    error: (err, req, res) => {
      console.error('Enrollment service proxy error:', err);
      res.status(503).json({ error: 'Enrollment service unavailable' });
    }
  }
}));

app.use('/api/grades', createProxyMiddleware({
  target: process.env.GRADE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/grades': '' },
  on: {
    error: (err, req, res) => {
      console.error('Grade service proxy error:', err);
      res.status(503).json({ error: 'Grade service unavailable' });
    }
  }
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});