const User = require('../models/User');

/**
 * @desc    Get all user settings
 * @route   GET /api/student/settings
 * @access  Private (Student only)
 */
exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('settings');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      settings: user.settings || {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update general settings
 * @route   PUT /api/student/settings/general
 * @access  Private (Student only)
 */
exports.updateGeneralSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { language, timezone, dateFormat, timeFormat, assessmentView, itemsPerPage, defaultSort, autoSave } = req.body;

    const updateFields = {};
    if (language) updateFields['settings.language'] = language;
    if (timezone) updateFields['settings.timezone'] = timezone;
    if (dateFormat) updateFields['settings.dateFormat'] = dateFormat;
    if (timeFormat) updateFields['settings.timeFormat'] = timeFormat;
    if (assessmentView) updateFields['settings.assessmentView'] = assessmentView;
    if (itemsPerPage) updateFields['settings.itemsPerPage'] = itemsPerPage;
    if (defaultSort) updateFields['settings.defaultSort'] = defaultSort;
    if (autoSave) {
      if (autoSave.enabled !== undefined) updateFields['settings.autoSave.enabled'] = autoSave.enabled;
      if (autoSave.interval !== undefined) updateFields['settings.autoSave.interval'] = autoSave.interval;
      if (autoSave.showNotifications !== undefined) updateFields['settings.autoSave.showNotifications'] = autoSave.showNotifications;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('settings');

    res.status(200).json({
      success: true,
      message: 'General settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update notification settings
 * @route   PUT /api/student/settings/notifications
 * @access  Private (Student only)
 */
exports.updateNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { email, browser, inApp, digestMode, quietHours } = req.body;

    const updateFields = {};
    
    if (email) {
      Object.keys(email).forEach(key => {
        updateFields[`settings.notifications.email.${key}`] = email[key];
      });
    }

    if (browser) {
      Object.keys(browser).forEach(key => {
        updateFields[`settings.notifications.browser.${key}`] = browser[key];
      });
    }

    if (inApp) {
      Object.keys(inApp).forEach(key => {
        updateFields[`settings.notifications.inApp.${key}`] = inApp[key];
      });
    }

    if (digestMode !== undefined) {
      updateFields['settings.notifications.digestMode'] = digestMode;
    }

    if (quietHours) {
      Object.keys(quietHours).forEach(key => {
        updateFields[`settings.notifications.quietHours.${key}`] = quietHours[key];
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('settings');

    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appearance settings
 * @route   PUT /api/student/settings/appearance
 * @access  Private (Student only)
 */
exports.updateAppearanceSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { theme, primaryColor, fontSize, layoutDensity, sidebarPosition, sidebarDefaultState, dashboardCustomization } = req.body;

    const updateFields = {};
    if (theme) updateFields['settings.appearance.theme'] = theme;
    if (primaryColor) updateFields['settings.appearance.primaryColor'] = primaryColor;
    if (fontSize) updateFields['settings.appearance.fontSize'] = fontSize;
    if (layoutDensity) updateFields['settings.appearance.layoutDensity'] = layoutDensity;
    if (sidebarPosition) updateFields['settings.appearance.sidebarPosition'] = sidebarPosition;
    if (sidebarDefaultState) updateFields['settings.appearance.sidebarDefaultState'] = sidebarDefaultState;
    
    if (dashboardCustomization) {
      Object.keys(dashboardCustomization).forEach(key => {
        updateFields[`settings.appearance.dashboardCustomization.${key}`] = dashboardCustomization[key];
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('settings');

    res.status(200).json({
      success: true,
      message: 'Appearance settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update privacy settings
 * @route   PUT /api/student/settings/privacy
 * @access  Private (Student only)
 */
exports.updatePrivacySettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { profileVisibility, showActivityStatus, sharePerformance, allowAnalytics, allowTracking, allowRecommendations } = req.body;

    const updateFields = {};
    if (profileVisibility) updateFields['settings.privacy.profileVisibility'] = profileVisibility;
    if (showActivityStatus !== undefined) updateFields['settings.privacy.showActivityStatus'] = showActivityStatus;
    if (sharePerformance !== undefined) updateFields['settings.privacy.sharePerformance'] = sharePerformance;
    if (allowAnalytics !== undefined) updateFields['settings.privacy.allowAnalytics'] = allowAnalytics;
    if (allowTracking !== undefined) updateFields['settings.privacy.allowTracking'] = allowTracking;
    if (allowRecommendations !== undefined) updateFields['settings.privacy.allowRecommendations'] = allowRecommendations;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('settings');

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update accessibility settings
 * @route   PUT /api/student/settings/accessibility
 * @access  Private (Student only)
 */
exports.updateAccessibilitySettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updateFields = {};

    // Map all accessibility settings
    const accessibilityKeys = [
      'highContrast', 'reduceMotion', 'largeCursor', 'focusIndicators',
      'screenReaderOptimized', 'readNotificationsAloud', 'keyboardShortcuts',
      'showShortcutHints', 'dyslexiaFriendlyFont', 'lineHeight', 'letterSpacing'
    ];

    accessibilityKeys.forEach(key => {
      if (req.body[key] !== undefined) {
        updateFields[`settings.accessibility.${key}`] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('settings');

    res.status(200).json({
      success: true,
      message: 'Accessibility settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    next(error);
  }
};
