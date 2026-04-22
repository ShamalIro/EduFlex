const nodemailer = require('nodemailer');

let transporter = null;

const hasEmailConfig = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  return transporter;
};

const formatDateTime = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return String(value);
  }
};

const sendAssignmentSubmittedEmail = async ({ to, studentName, assignmentTitle, submittedAt }) => {
  if (!hasEmailConfig()) {
    console.warn('[Email] Skipped: EMAIL_USER or EMAIL_PASSWORD is missing');
    return {
      sent: false,
      reason: 'Email configuration is missing'
    };
  }

  if (!to) {
    console.warn('[Email] Skipped: recipient email is missing in token payload');
    return {
      sent: false,
      reason: 'Student email is missing in token payload'
    };
  }

  const safeName = studentName || 'Student';
  const safeTitle = assignmentTitle || 'Assignment';
  const safeTime = formatDateTime(submittedAt || new Date());

  console.info(`[Email] Sending assignment submission email to ${to} for "${safeTitle}"`);

  const result = await getTransporter().sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'EduFlex - Assignment Submitted Successfully',
    text: `Hi ${safeName},\n\nYour assignment "${safeTitle}" was submitted successfully at ${safeTime}.\n\nThanks,\nEduFlex Team`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">Assignment Submitted</h2>
        <p>Hi ${safeName},</p>
        <p>Your assignment <strong>${safeTitle}</strong> was submitted successfully.</p>
        <p><strong>Submitted at:</strong> ${safeTime}</p>
        <p style="margin-top: 20px;">Thanks,<br/>EduFlex Team</p>
      </div>
    `
  });

  console.info(`[Email] Sent successfully to ${to}. Message ID: ${result.messageId}`);

  return {
    sent: true,
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected
  };
};

module.exports = {
  sendAssignmentSubmittedEmail
};
