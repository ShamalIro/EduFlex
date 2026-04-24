const Payment = require('../models/paymentModel');
const { sendPaymentReceiptEmail } = require('../utils/emailHelper');
const axios = require('axios');

const createPaymentIntent = async (req, res) => {
  try {
    const { course_id, course_title, amount, currency = 'usd' } = req.body;
    const user_id = req.user.id;

    if (!course_id || !course_title || !amount) {
      return res.status(400).json({ message: 'course_id, course_title and amount are required' });
    }

    const payment = new Payment({
      user_id,
      course_id,
      course_title,
      amount,
      currency,
      status: 'pending',
      stripe_payment_intent_id: 'mock_' + Date.now()
    });

    await payment.save();

    res.status(201).json({
      success: true,
      client_secret: 'mock_secret_' + Date.now(),
      payment_id: payment._id
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Payment intent creation failed', error: error.message });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { payment_intent_id } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      payment_intent_id,
      { status: 'success' },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // ✅ Send receipt email
    try {
      const userEmail = req.user.email;
      if (userEmail) {
        await sendPaymentReceiptEmail(
          userEmail,
          payment.course_title,
          payment.amount,
          payment._id.toString()
        );
        console.log(`✅ Receipt email sent to ${userEmail}`);
      }
    } catch (emailError) {
      console.error('Receipt email error:', emailError.message);
    }

    // ✅ Create notification
    try {
      await axios.post('http://localhost:4006/api/notifications', {
        user_id: req.user.id.toString(),
        title: 'Payment Successful! 🎉',
        message: `You are now enrolled in ${payment.course_title}`,
        type: 'payment',
        icon: '💳',
        link: '/student/my-courses' // ✅ Added
      });
      console.log(`✅ Notification created for user ${req.user.id}`);
    } catch (notifError) {
      console.error('Notification error:', notifError.message);
    }

    res.status(200).json({
      success: true,
      status: 'success',
      payment
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Payment confirmation failed', error: error.message });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const payments = await Payment.find({ user_id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history', error: error.message });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { course_id } = req.params;
    const user_id = req.user.id;

    const payment = await Payment.findOne({
      user_id,
      course_id,
      status: 'success'
    });

    res.status(200).json({
      success: true,
      paid: !!payment,
      payment: payment || null
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Failed to fetch payment status', error: error.message });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentStatus
};