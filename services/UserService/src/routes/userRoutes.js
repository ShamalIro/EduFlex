const express = require('express');
const router = express.Router();

// Temporary routes for testing
router.get('/', (req, res) => {
  res.json({ message: 'User service is working!' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - coming soon' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - coming soon' });
});

module.exports = router;