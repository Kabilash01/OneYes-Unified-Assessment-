const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { generateToken } = require('../utils/tokenGenerator');
const emailService = require('../services/emailService');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, instituteCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      instituteCode,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toPublicJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toPublicJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user details
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // User is already attached to req by authMiddleware
    res.status(200).json({
      success: true,
      data: {
        user: req.user.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, instituteCode, profilePic } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (instituteCode) updateData.instituteCode = instituteCode;
    if (profilePic) updateData.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    // Invalidate any existing tokens for this user
    await PasswordReset.invalidateUserTokens(user._id);

    // Create new password reset request
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';
    
    const resetRequest = await PasswordReset.createResetRequest(
      user._id,
      user.email,
      ipAddress,
      userAgent
    );

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetRequest.token
      );
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue anyway - don't expose email sending errors
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/verify-reset-token
 * @desc    Verify password reset token validity
 * @access  Public
 */
const verifyResetToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required',
      });
    }

    // Verify token
    const resetRequest = await PasswordReset.verifyToken(token);

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        email: resetRequest.email,
        userId: resetRequest.userId._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    // Verify token
    const resetRequest = await PasswordReset.verifyToken(token);

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Get user
    const user = await User.findById(resetRequest.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Mark token as used
    await resetRequest.markAsUsed();

    // Invalidate all other tokens for this user
    await PasswordReset.invalidateUserTokens(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyResetToken,
  resetPassword,
};
