const User = require('../models/User');

/**
 * Get users (for ticket assignment)
 * @route GET /api/users
 * @access Private (Instructor/Admin)
 */
exports.getUsers = async (req, res) => {
  try {
    const { role, limit = 100, search } = req.query;

    // Build query
    const query = {};

    // Filter by role if specified
    if (role) {
      const roles = role.split(',').map(r => r.trim());
      query.role = { $in: roles };
    }

    // Search by name or email if specified
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch users
    const users = await User.find(query)
      .select('firstName lastName email role profileImage')
      .limit(parseInt(limit))
      .sort({ firstName: 1, lastName: 1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName email role profileImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch user',
      error: error.message 
    });
  }
};
