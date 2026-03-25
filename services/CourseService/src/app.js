const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4002;

connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Course Service',
    timestamp: new Date().toISOString()
  });
});

// Routes are mounted at / because API Gateway handles /api/courses prefix
app.use('/api/courses', require('./routes/courseRoutes'));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Course Service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});