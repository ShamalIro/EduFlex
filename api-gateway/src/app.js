const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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

// User Service
app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/api/users' },
  on: {
    error: (err, req, res) => {
      console.error('User service proxy error:', err.message);
      res.status(503).json({ error: 'User service unavailable' });
    }
  }
}));

// Course Service
app.use('/api/courses', createProxyMiddleware({
  target: process.env.COURSE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/courses': '' },
  on: {
    error: (err, req, res) => {
      console.error('Course service proxy error:', err.message);
      res.status(503).json({ error: 'Course service unavailable' });
    }
  }
}));

// Assignment Service
app.use('/api/assignments', createProxyMiddleware({
  target: process.env.ASSIGNMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/assignments': '' },
  on: {
    error: (err, req, res) => {
      console.error('Assignment service proxy error:', err.message);
      res.status(503).json({ error: 'Assignment service unavailable' });
    }
  }
}));

// Enrollment Service
app.use('/api/enrollments', createProxyMiddleware({
  target: process.env.ENROLLMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/enrollments': '' },
  on: {
    error: (err, req, res) => {
      console.error('Enrollment service proxy error:', err.message);
      res.status(503).json({ error: 'Enrollment service unavailable' });
    }
  }
}));

// Payment Service
app.use('/api/payments', createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/payments': '/api/payments' },
  on: {
    error: (err, req, res) => {
      console.error('Payment service proxy error:', err.message);
      res.status(503).json({ error: 'Payment service unavailable' });
    }
  }
}));

// OTP Service
app.use('/api/otp', createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/otp': '/api/otp' },
  on: {
    error: (err, req, res) => {
      console.error('OTP proxy error:', err.message);
      res.status(503).json({ error: 'OTP service unavailable' });
    }
  }
}));

// Notification Service
app.use('/api/notifications', createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '/api/notifications' },
  on: {
    error: (err, req, res) => {
      console.error('Notification service proxy error:', err.message);
      res.status(503).json({ error: 'Notification service unavailable' });
    }
  }
}));

// Grade/Enrollment Service — axios direct forward
app.use('/api/grades', express.json(), async (req, res) => {
  try {
    const targetUrl = `${process.env.GRADE_SERVICE_URL}${req.url}`;
    console.log(`[GRADES] ${req.method} → ${targetUrl}`);

    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && {
          'Authorization': req.headers.authorization
        })
      },
      data: req.body,
      validateStatus: () => true
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Grade service error:', error.message);
    return res.status(503).json({ error: 'Grade service unavailable' });
  }
});

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