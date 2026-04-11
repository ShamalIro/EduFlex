const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'API Gateway',
    timestamp: new Date().toISOString() 
  });
});

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
  pathRewrite: { '^/api/enrollments': '' },
  on: {
    error: (err, req, res) => {
      console.error('Enrollment service proxy error:', err);
      res.status(503).json({ error: 'Enrollment service unavailable' });
    }
  }
}));

app.use('/api/payments', createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/payments': '/api/payments' },
  on: {
    error: (err, req, res) => {
      console.error('Payment service proxy error:', err);
      res.status(503).json({ error: 'Payment service unavailable' });
    }
  }
}));

// ✅ OTP route
app.use('/api/otp', createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/otp': '/api/otp' },
  on: {
    error: (err, req, res) => {
      console.error('OTP service proxy error:', err);
      res.status(503).json({ error: 'OTP service unavailable' });
    }
  }
}));
app.use('/api/notifications', createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '/api/notifications' },
  on: {
    error: (err, req, res) => {
      console.error('Notification service proxy error:', err);
      res.status(503).json({ error: 'Notification service unavailable' });
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

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});