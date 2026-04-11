const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { sendOTP, verifyOTP } = require('../controllers/otpController');

router.post('/send', authMiddleware, sendOTP);
router.post('/verify', authMiddleware, verifyOTP);

module.exports = router;