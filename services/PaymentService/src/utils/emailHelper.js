const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (toEmail, otp, courseTitle, amount) => {
  const mailOptions = {
    from: `"EduFlex" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'EduFlex Payment Verification — Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1a73e8; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">EduFlex</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; margin-bottom: 10px;">Payment Verification</h2>
          <p style="color: #555;">You are about to complete payment for:</p>
          <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; color: #333;">${courseTitle}</p>
            <p style="margin: 5px 0 0; color: #1a73e8; font-size: 20px; font-weight: bold;">$${amount}</p>
          </div>
          <p style="color: #555;">Your OTP verification code is:</p>
          <div style="background: #1a73e8; color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #888; font-size: 13px;">This code expires in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #aaa; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// ✅ Payment Receipt Email
const sendPaymentReceiptEmail = async (toEmail, courseTitle, amount, paymentId) => {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"EduFlex" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'EduFlex Payment Receipt — Thank You!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1a73e8; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">EduFlex</h1>
          <p style="color: #cce4ff; margin: 5px 0 0; font-size: 14px;">Payment Receipt</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">

          <div style="text-align: center; margin-bottom: 25px;">
            <div style="width: 60px; height: 60px; background: #e8f5e9; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px;">
              <span style="font-size: 30px;">✅</span>
            </div>
            <h2 style="color: #2e7d32; margin: 0;">Payment Successful!</h2>
            <p style="color: #666; margin: 5px 0 0;">Thank you for your purchase.</p>
          </div>

          <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #333; margin: 0 0 15px; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Course</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold; font-size: 14px; text-align: right;">${courseTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Payment ID</td>
                <td style="padding: 8px 0; color: #333; font-size: 12px; text-align: right;">${paymentId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Date</td>
                <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${date}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 12px 0; color: #333; font-weight: bold; font-size: 16px;">Total Paid</td>
                <td style="padding: 12px 0; color: #1a73e8; font-weight: bold; font-size: 20px; text-align: right;">$${amount}</td>
              </tr>
            </table>
          </div>

          <div style="background: #e8f5e9; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; color: #2e7d32; font-size: 14px;">
              🎓 You are now enrolled in <strong>${courseTitle}</strong>. Start learning today!
            </p>
          </div>

          <div style="background: #fff3e0; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; color: #e65100; font-size: 13px;">
              💰 <strong>30-Day Money-Back Guarantee</strong> — If you're not satisfied, contact us within 30 days for a full refund.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #aaa; font-size: 12px; text-align: center;">
            This is an automated receipt from EduFlex. Please keep it for your records.
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, sendPaymentReceiptEmail };