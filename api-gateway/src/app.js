const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  pathRewrite: {
    '^/api/users': '/api/users'
  },
  onError: (err, req, res) => {
    console.error('User service proxy error:', err);
    res.status(503).json({ error: 'User service unavailable' });
  }
}));

app.use('/api/courses', createProxyMiddleware({
  target: process.env.COURSE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/courses': '/api/courses'
  },
  onError: (err, req, res) => {
    console.error('Course service proxy error:', err);
    res.status(503).json({ error: 'Course service unavailable' });
  }
}));

app.use('/api/assignments', createProxyMiddleware({
  target: process.env.ASSIGNMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/assignments': '/api/assignments'
  },
  onError: (err, req, res) => {
    console.error('Assignment service proxy error:', err);
    res.status(503).json({ error: 'Assignment service unavailable' });
  }
}));

app.use('/api/grades', createProxyMiddleware({
  target: process.env.GRADE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/grades': '/api/grades'
  },
  onError: (err, req, res) => {
    console.error('Grade service proxy error:', err);
    res.status(503).json({ error: 'Grade service unavailable' });
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