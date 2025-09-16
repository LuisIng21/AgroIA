const express = require('express');
const { User } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, active } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (role) where.role = role;
    if (active !== undefined) where.isActive = active === 'true';

    const users = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    res.json({
      users: users.rows,
      total: users.count,
      page: parseInt(page),
      pages: Math.ceil(users.count / limit)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to retrieve users',
      message: 'Unable to get users list'
    });
  }
});

// Get user by ID (admin and technician)
router.get('/:id', authMiddleware, requireRole('admin', 'technician'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: ['farms', 'detections']
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user',
      message: 'Unable to get user information'
    });
  }
});

// Update user (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'role', 'isActive', 'location', 'preferences'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await user.update(updates);

    res.json({
      message: 'User updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: 'Unable to update user information'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Soft delete by setting isActive to false
    await user.update({ isActive: false });

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: 'Unable to delete user'
    });
  }
});

// Get user statistics (admin and technician)
router.get('/stats/overview', authMiddleware, requireRole('admin', 'technician'), async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const usersByRole = await User.findAll({
      attributes: ['role', [User.sequelize.fn('COUNT', User.sequelize.col('role')), 'count']],
      group: ['role'],
      raw: true
    });

    const recentUsers = await User.count({
      where: {
        createdAt: {
          [User.sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = parseInt(item.count);
        return acc;
      }, {}),
      recentUsers
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user statistics',
      message: 'Unable to get user statistics'
    });
  }
});

module.exports = router;