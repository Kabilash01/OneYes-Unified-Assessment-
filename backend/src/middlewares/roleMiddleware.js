/**
 * Role-Based Access Control Middleware
 * @description Restricts access based on user roles
 * @param {...string} roles - Allowed roles for the route
 */
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be attached by authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is restricted to ${roles.join(', ')} only.`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
