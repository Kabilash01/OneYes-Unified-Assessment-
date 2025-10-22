/**
 * Email Utility - Wrapper for emailService
 * Provides a simple interface for sending emails
 */

const { sendEmail: emailServiceSend } = require('../services/emailService');

/**
 * Send email using the email service
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @param {Array} options.attachments - Email attachments (optional)
 * @returns {Promise} Email send result
 */
const sendEmail = async (options) => {
  try {
    return await emailServiceSend(options);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};

module.exports = sendEmail;
