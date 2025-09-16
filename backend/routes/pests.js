const express = require('express');
const { Pest, Recommendation } = require('../models');
const { authMiddleware, requireRole, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all pests (public with optional auth for favorites)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, severity, search } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { isActive: true };
    if (type) where.type = type;
    if (severity) where.severity = severity;
    
    let pests;
    if (search) {
      pests = await Pest.searchByName(search);
    } else {
      const result = await Pest.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']]
      });
      pests = result.rows;
    }

    res.json({
      pests,
      total: pests.length,
      page: parseInt(page),
      pages: Math.ceil(pests.length / limit)
    });
  } catch (error) {
    console.error('Get pests error:', error);
    res.status(500).json({
      error: 'Failed to retrieve pests',
      message: 'Unable to get pests list'
    });
  }
});

// Get pest by ID with recommendations
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const pest = await Pest.findByPk(req.params.id, {
      where: { isActive: true }
    });

    if (!pest) {
      return res.status(404).json({
        error: 'Pest not found',
        message: 'The requested pest does not exist'
      });
    }

    // Get recommendations for this pest
    const recommendations = await Recommendation.findByPest(pest.id);

    res.json({
      pest,
      recommendations
    });
  } catch (error) {
    console.error('Get pest error:', error);
    res.status(500).json({
      error: 'Failed to retrieve pest',
      message: 'Unable to get pest information'
    });
  }
});

// Create new pest (admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const pest = await Pest.create(req.body);
    
    res.status(201).json({
      message: 'Pest created successfully',
      pest
    });
  } catch (error) {
    console.error('Create pest error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'Pest already exists',
        message: 'A pest with this name already exists'
      });
    }
    
    res.status(500).json({
      error: 'Failed to create pest',
      message: 'Unable to create pest record'
    });
  }
});

// Update pest (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const pest = await Pest.findByPk(req.params.id);
    
    if (!pest) {
      return res.status(404).json({
        error: 'Pest not found',
        message: 'The requested pest does not exist'
      });
    }

    await pest.update(req.body);

    res.json({
      message: 'Pest updated successfully',
      pest
    });
  } catch (error) {
    console.error('Update pest error:', error);
    res.status(500).json({
      error: 'Failed to update pest',
      message: 'Unable to update pest information'
    });
  }
});

// Delete pest (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const pest = await Pest.findByPk(req.params.id);
    
    if (!pest) {
      return res.status(404).json({
        error: 'Pest not found',
        message: 'The requested pest does not exist'
      });
    }

    // Soft delete
    await pest.update({ isActive: false });

    res.json({
      message: 'Pest deleted successfully'
    });
  } catch (error) {
    console.error('Delete pest error:', error);
    res.status(500).json({
      error: 'Failed to delete pest',
      message: 'Unable to delete pest'
    });
  }
});

// Get pest types and statistics
router.get('/stats/overview', optionalAuth, async (req, res) => {
  try {
    const pestsByType = await Pest.findAll({
      attributes: ['type', [Pest.sequelize.fn('COUNT', Pest.sequelize.col('type')), 'count']],
      where: { isActive: true },
      group: ['type'],
      raw: true
    });

    const pestsBySeverity = await Pest.findAll({
      attributes: ['severity', [Pest.sequelize.fn('COUNT', Pest.sequelize.col('severity')), 'count']],
      where: { isActive: true },
      group: ['severity'],
      raw: true
    });

    const totalPests = await Pest.count({ where: { isActive: true } });

    res.json({
      totalPests,
      pestsByType: pestsByType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {}),
      pestsBySeverity: pestsBySeverity.reduce((acc, item) => {
        acc[item.severity] = parseInt(item.count);
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get pest stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve pest statistics',
      message: 'Unable to get pest statistics'
    });
  }
});

// Search pests by symptoms or characteristics
router.post('/search', optionalAuth, async (req, res) => {
  try {
    const { symptoms, affectedParts, type, severity } = req.body;
    const { Op } = require('sequelize');
    
    const where = { isActive: true };
    const conditions = [];

    if (symptoms && symptoms.length > 0) {
      conditions.push({
        symptoms: {
          [Op.overlap]: symptoms
        }
      });
    }

    if (affectedParts && affectedParts.length > 0) {
      conditions.push({
        affectedParts: {
          [Op.overlap]: affectedParts
        }
      });
    }

    if (type) where.type = type;
    if (severity) where.severity = severity;

    if (conditions.length > 0) {
      where[Op.and] = conditions;
    }

    const pests = await Pest.findAll({
      where,
      order: [['severity', 'DESC'], ['name', 'ASC']]
    });

    res.json({
      pests,
      total: pests.length
    });
  } catch (error) {
    console.error('Search pests error:', error);
    res.status(500).json({
      error: 'Failed to search pests',
      message: 'Unable to search pests'
    });
  }
});

module.exports = router;