const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentStatus
} = require('../controllers/paymentController');

router.post('/create-intent', authMiddleware, createPaymentIntent);
router.post('/confirm', authMiddleware, confirmPayment);
router.get('/history', authMiddleware, getPaymentHistory);
router.get('/course/:course_id/status', authMiddleware, getPaymentStatus);

module.exports = router;