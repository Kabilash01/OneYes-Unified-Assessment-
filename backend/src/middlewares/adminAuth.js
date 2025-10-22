const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Admin Authentication Middleware
 * @description Verifies JWT token and ensures user has admin role
 */

const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

/**
 * Optional admin auth - doesn't block request if not admin
 * Useful for routes that have different behavior for admins
 */
const optionalAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (user && user.isActive && user.role === 'admin') {
      req.user = user;
      req.isAdmin = true;
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

/**
 * Check if user is super admin
 * Useful for sensitive operations like deleting all data
 */
const superAdminAuth = async (req, res, next) => {
  try {
    await adminAuth(req, res, () => {});

    // Check if user has super admin flag or email matches super admin
    const isSuperAdmin =
      req.user.email === process.env.SUPER_ADMIN_EMAIL ||
      req.user.isSuperAdmin === true;

    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error during super admin authentication.',
    });
  }
};

module.exports = {
  adminAuth,
  optionalAdminAuth,
  superAdminAuth,
};
