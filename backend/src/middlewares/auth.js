/**
 * Auth Middleware Exports
 * Provides protect and authorize functions for route protection
 */

const authMiddleware = require('./authMiddleware');
const roleMiddleware = require('./roleMiddleware');

/**
 * Protect routes - require authentication
 */
const protect = authMiddleware;

/**
 * Authorize routes - require specific roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return roleMiddleware(...roles);
};

module.exports = {
  protect,
  authorize
};
