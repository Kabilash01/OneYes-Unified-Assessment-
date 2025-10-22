const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a notification
 * @param {Object} data - Notification data
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (data) => {
  try {
    const notification = await Notification.create({
      recipientId: data.recipientId,
      userId: data.recipientId, // Support both fields for compatibility
      type: data.type,
      title: data.title,
      message: data.message,
      relatedId: data.relatedId,
      relatedModel: data.relatedModel,
      priority: data.priority || 'medium',
      link: data.link || '',
      expiresAt: data.expiresAt
    });

    console.log(`✅ Notification created for user ${data.recipientId}`);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Notify all admins
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {ObjectId} relatedId - Related document ID
 * @param {string} relatedModel - Related model name
 * @param {string} priority - Priority level
 * @returns {Promise<Array>} Created notifications
 */
const notifyAllAdmins = async (type, title, message, relatedId = null, relatedModel = null, priority = 'medium') => {
  try {
    // Find all admin users
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    
    if (admins.length === 0) {
      console.log('⚠️ No active admins found to notify');
      return [];
    }

    // Create notifications for all admins
    const notificationPromises = admins.map(admin =>
      createNotification({
        recipientId: admin._id,
        type,
        title,
        message,
        relatedId,
        relatedModel,
        priority
      })
    );

    const notifications = await Promise.all(notificationPromises);
    console.log(`✅ Created ${notifications.length} notifications for admins`);
    
    return notifications;
  } catch (error) {
    console.error('Error notifying admins:', error);
    return [];
  }
};

/**
 * Create notification for user registration
 * @param {ObjectId} userId - New user's ID
 * @returns {Promise<Array>} Created notifications
 */
const createUserRegistrationNotification = async (userId) => {
  try {
    const user = await User.findById(userId).select('name email role');
    
    if (!user) {
      console.error('User not found for registration notification');
      return [];
    }

    return await notifyAllAdmins(
      'user_registered',
      'New User Registered',
      `${user.name} (${user.role}) has registered with email ${user.email}`,
      userId,
      'User',
      'low'
    );
  } catch (error) {
    console.error('Error creating user registration notification:', error);
    return [];
  }
};

/**
 * Create notification for assessment creation
 * @param {ObjectId} assessmentId - Assessment ID
 * @returns {Promise<Array>} Created notifications
 */
const createAssessmentNotification = async (assessmentId) => {
  try {
    const Assessment = require('../models/Assessment');
    const assessment = await Assessment.findById(assessmentId)
      .populate('createdBy', 'name')
      .select('title createdBy');
    
    if (!assessment) {
      console.error('Assessment not found for notification');
      return [];
    }

    const instructorName = assessment.createdBy?.name || 'Unknown Instructor';

    return await notifyAllAdmins(
      'assessment_created',
      'New Assessment Created',
      `Assessment "${assessment.title}" was created by ${instructorName}`,
      assessmentId,
      'Assessment',
      'low'
    );
  } catch (error) {
    console.error('Error creating assessment notification:', error);
    return [];
  }
};

/**
 * Create notification for suspicious activity
 * @param {Object} activityDetails - Activity details
 * @returns {Promise<Array>} Created notifications
 */
const createSuspiciousActivityNotification = async (activityDetails) => {
  try {
    const { type, userId, details, severity } = activityDetails;
    
    let message = 'Suspicious activity detected on the platform.';
    
    if (type === 'failed_login') {
      message = `Multiple failed login attempts detected. Details: ${details}`;
    } else if (type === 'rapid_submissions') {
      message = `Unusual submission pattern detected. Details: ${details}`;
    } else if (type === 'tab_switching') {
      message = `Excessive tab switching detected during assessment. Details: ${details}`;
    } else {
      message = details || message;
    }

    return await notifyAllAdmins(
      'suspicious_activity',
      '⚠️ Suspicious Activity Alert',
      message,
      userId,
      'ActivityLog',
      severity || 'high'
    );
  } catch (error) {
    console.error('Error creating suspicious activity notification:', error);
    return [];
  }
};

/**
 * Create system alert notification
 * @param {string} message - Alert message
 * @param {string} priority - Priority level
 * @returns {Promise<Array>} Created notifications
 */
const createSystemAlertNotification = async (message, priority = 'medium') => {
  try {
    return await notifyAllAdmins(
      'system_alert',
      '🔔 System Alert',
      message,
      null,
      null,
      priority
    );
  } catch (error) {
    console.error('Error creating system alert notification:', error);
    return [];
  }
};

/**
 * Create announcement notification
 * @param {ObjectId} announcementId - Announcement ID
 * @param {string} title - Announcement title
 * @param {Array} targetUserIds - Array of user IDs to notify
 * @param {string} priority - Priority level
 * @returns {Promise<Array>} Created notifications
 */
const createAnnouncementNotifications = async (announcementId, title, targetUserIds, priority = 'medium') => {
  try {
    if (!targetUserIds || targetUserIds.length === 0) {
      console.log('No target users for announcement notification');
      return [];
    }

    const notificationPromises = targetUserIds.map(userId =>
      createNotification({
        recipientId: userId,
        type: 'announcement',
        title: `📢 ${title}`,
        message: `New announcement: ${title}`,
        relatedId: announcementId,
        relatedModel: 'Announcement',
        priority
      })
    );

    const notifications = await Promise.all(notificationPromises);
    console.log(`✅ Created ${notifications.length} announcement notifications`);
    
    return notifications;
  } catch (error) {
    console.error('Error creating announcement notifications:', error);
    return [];
  }
};

module.exports = {
  createNotification,
  notifyAllAdmins,
  createUserRegistrationNotification,
  createAssessmentNotification,
  createSuspiciousActivityNotification,
  createSystemAlertNotification,
  createAnnouncementNotifications
};
