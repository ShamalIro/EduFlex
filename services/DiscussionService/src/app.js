const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/database');
const discussionRoutes = require('./routes/discussionRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 4008;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Discussion Service',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Discussion Service is running' });
});

// Routes
app.use('/api/discussions', discussionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect DB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Discussion Service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
});