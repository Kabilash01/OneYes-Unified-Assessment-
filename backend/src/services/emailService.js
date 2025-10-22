const { transporter } = require('../config/email');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

/**
 * Compile email template with Handlebars
 * @param {string} templateName - Name of the template file (without .html)
 * @param {object} data - Data to populate in template
 * @returns {Promise<string>} Compiled HTML string
 */
const compileTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, '../../templates/emails', `${templateName}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(templateContent);
    return compiledTemplate(data);
  } catch (error) {
    console.error(`Error compiling template ${templateName}:`, error);
    throw new Error(`Failed to compile email template: ${templateName}`);
  }
};

/**
 * Send email using nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of email
 * @param {string} textContent - Plain text content (fallback)
 * @returns {Promise<object>} Email send result
 */
const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Unified Assessment Platform'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to} - MessageId: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    // Don't throw error - fail silently to not disrupt main flow
    return { error: error.message };
  }
};

/**
 * Send welcome email to newly created user
 * @param {string} userEmail - User's email
 * @param {string} userName - User's name
 * @param {string} userRole - User's role
 * @param {string} temporaryPassword - Temporary password
 * @returns {Promise<object>} Email send result
 */
const sendUserCreatedEmail = async (userEmail, userName, userRole, temporaryPassword) => {
  try {
    const instituteName = process.env.INSTITUTE_NAME || 'Unified Assessment Platform';
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5175'}/login`;

    const htmlContent = await compileTemplate('userCreated', {
      userName,
      userEmail,
      userRole,
      temporaryPassword,
      instituteName,
      loginUrl
    });

    return await sendEmail(
      userEmail,
      `Welcome to ${instituteName} - Account Created`,
      htmlContent
    );
  } catch (error) {
    console.error('Error sending user created email:', error);
    return { error: error.message };
  }
};

/**
 * Send account suspended email
 * @param {string} userEmail - User's email
 * @param {string} userName - User's name
 * @param {string} suspensionReason - Reason for suspension
 * @returns {Promise<object>} Email send result
 */
const sendUserSuspendedEmail = async (userEmail, userName, suspensionReason) => {
  try {
    const instituteName = process.env.INSTITUTE_NAME || 'Unified Assessment Platform';
    const supportUrl = `${process.env.FRONTEND_URL || 'http://localhost:5175'}/support`;
    const suspensionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = await compileTemplate('userSuspended', {
      userName,
      suspensionReason: suspensionReason || 'Policy violation',
      suspensionDate,
      instituteName,
      supportUrl
    });

    return await sendEmail(
      userEmail,
      `Account Suspended - ${instituteName}`,
      htmlContent
    );
  } catch (error) {
    console.error('Error sending user suspended email:', error);
    return { error: error.message };
  }
};

/**
 * Send password reset email with token
 * @param {string} userEmail - User's email
 * @param {string} userName - User's name
 * @param {string} resetToken - Password reset token
 * @returns {Promise<object>} Email send result
 */
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  try {
    const instituteName = process.env.INSTITUTE_NAME || 'Unified Assessment Platform';
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5175'}/reset-password?token=${resetToken}`;
    const requestDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const htmlContent = await compileTemplate('passwordReset', {
      userName,
      userEmail,
      resetUrl,
      requestDate,
      instituteName
    });

    return await sendEmail(
      userEmail,
      `Password Reset Request - ${instituteName}`,
      htmlContent
    );
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { error: error.message };
  }
};

/**
 * Send announcement email to multiple recipients
 * @param {Array<string>} recipients - Array of email addresses
 * @param {string} announcementTitle - Title of announcement
 * @param {string} announcementMessage - Message content (can be HTML)
 * @param {string} priority - Priority level
 * @returns {Promise<object>} Email send results
 */
const sendAnnouncementEmail = async (recipients, announcementTitle, announcementMessage, priority = 'medium') => {
  try {
    const instituteName = process.env.INSTITUTE_NAME || 'Unified Assessment Platform';
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const htmlContent = await compileTemplate('announcementEmail', {
      announcementTitle,
      announcementMessage,
      priority: priority.toUpperCase(),
      date,
      instituteName
    });

    // Send emails in batches of 50 to avoid rate limits
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      // Use BCC for privacy
      const bccList = batch.join(', ');
      
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || instituteName}" <${process.env.EMAIL_USER}>`,
        bcc: bccList,
        subject: announcementTitle,
        html: htmlContent
      };

      try {
        const result = await transporter.sendMail(mailOptions);
        results.push({ batch: i / batchSize + 1, success: true, count: batch.length, messageId: result.messageId });
        console.log(`✅ Announcement email batch ${i / batchSize + 1} sent to ${batch.length} recipients`);
      } catch (error) {
        results.push({ batch: i / batchSize + 1, success: false, error: error.message });
        console.error(`❌ Failed to send announcement email batch ${i / batchSize + 1}:`, error.message);
      }

      // Add delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    return {
      totalRecipients: recipients.length,
      batches: results,
      successCount: results.filter(r => r.success).reduce((sum, r) => sum + (r.count || 0), 0)
    };
  } catch (error) {
    console.error('Error sending announcement emails:', error);
    return { error: error.message };
  }
};

/**
 * Send account reactivation email
 * @param {string} userEmail - User's email
 * @param {string} userName - User's name
 * @returns {Promise<object>} Email send result
 */
const sendAccountReactivatedEmail = async (userEmail, userName) => {
  try {
    const instituteName = process.env.INSTITUTE_NAME || 'Unified Assessment Platform';
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5175'}/login`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}.container{max-width:600px;margin:20px auto;padding:20px;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);}.header{background:#10B981;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;}.button{display:inline-block;padding:12px 30px;background:#4F46E5;color:white!important;text-decoration:none;border-radius:5px;margin:20px 0;}</style></head>
      <body>
        <div class="container">
          <div class="header"><h1>Account Reactivated ✅</h1></div>
          <div style="padding:20px;">
            <h2>Hello ${userName},</h2>
            <p>Good news! Your account has been reactivated and you can now access the platform again.</p>
            <p style="text-align:center;"><a href="${loginUrl}" class="button">Login Now</a></p>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br><strong>${instituteName} Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await sendEmail(
      userEmail,
      `Account Reactivated - ${instituteName}`,
      htmlContent
    );
  } catch (error) {
    console.error('Error sending account reactivated email:', error);
    return { error: error.message };
  }
};

/**
 * Send test email (for admin testing)
 * @param {string} recipientEmail - Recipient email
 * @returns {Promise<object>} Email send result
 */
const sendTestEmail = async (recipientEmail) => {
  try {
    const instituteName = process.env.INSTITUTE_NAME || 'Unified Assessment Platform';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><style>body{font-family:Arial,sans-serif;}.container{max-width:600px;margin:20px auto;padding:20px;background:#fff;border:2px solid #4F46E5;border-radius:8px;}.header{background:#4F46E5;color:white;padding:20px;text-align:center;border-radius:6px;}</style></head>
      <body>
        <div class="container">
          <div class="header"><h1>✉️ Test Email</h1></div>
          <div style="padding:20px;">
            <p><strong>Email service is working correctly!</strong></p>
            <p>This is a test email from ${instituteName}.</p>
            <p>Timestamp: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await sendEmail(
      recipientEmail,
      `Test Email - ${instituteName}`,
      htmlContent,
      'Email service is working correctly! This is a test email.'
    );
  } catch (error) {
    console.error('Error sending test email:', error);
    return { error: error.message };
  }
};

module.exports = {
  compileTemplate,
  sendEmail,
  sendUserCreatedEmail,
  sendUserSuspendedEmail,
  sendPasswordResetEmail,
  sendAnnouncementEmail,
  sendAccountReactivatedEmail,
  sendTestEmail
};
