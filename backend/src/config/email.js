const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify transporter connection
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    console.log('ℹ️  Email features will be unavailable. Configure EMAIL_USER and EMAIL_PASSWORD in .env');
    return false;
  }
};

// Initialize email service (verify connection on startup)
// Commented out to allow server to start even without email configuration
// verifyEmailConnection();

module.exports = { transporter, verifyEmailConnection };
