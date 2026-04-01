const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4003;

connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Assessment Service',
    timestamp: new Date().toISOString()
  });
});

const assessmentRoutes = require('./routes/assessmentRoutes');

// Support direct calls and proxied calls from API gateway.
app.use('/', assessmentRoutes);
app.use('/api/assignments', assessmentRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Assessment Service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});