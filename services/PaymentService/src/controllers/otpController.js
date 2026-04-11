const { sendOTPEmail } = require('../utils/emailHelper');

const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (req, res) => {
  try {
    const { email, courseTitle, amount } = req.body;
    const user_id = req.user.id;

    if (!email || !courseTitle || !amount) {
      return res.status(400).json({ message: 'Email, courseTitle and amount are required' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(user_id, {
      otp,
      email,
      courseTitle,
      amount,
      expiresAt
    });

    await sendOTPEmail(email, otp, courseTitle, amount);

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email}`
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const user_id = req.user.id;

    const stored = otpStore.get(user_id);

    if (!stored) {
      return res.status(400).json({ message: 'OTP not found. Please request a new one.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(user_id);
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    otpStore.delete(user_id);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

module.exports = { sendOTP, verifyOTP };