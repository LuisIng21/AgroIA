const express = require('express');
const { Detection, Pest, Farm, User, TreatmentHistory } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get overview statistics
router.get('/overview', authMiddleware, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const { Op } = require('sequelize');
    
    const since = new Date();
    since.setDate(since.getDate() - parseInt(period));
    
    let baseWhere = {
      createdAt: { [Op.gte]: since }
    };

    // Filter by user role
    if (req.user.role === 'farmer') {
      baseWhere.userId = req.user.id;
    }

    // Total detections
    const totalDetections = await Detection.count({ where: baseWhere });
    
    // Confirmed vs pending detections
    const detectionStatus = await Detection.findAll({
      attributes: [
        'status',
        [Detection.sequelize.fn('COUNT', Detection.sequelize.col('status')), 'count']
      ],
      where: baseWhere,
      group: ['status'],
      raw: true
    });

    // Detections by severity
    const detectionsBySeverity = await Detection.findAll({
      attributes: [
        'severity',
        [Detection.sequelize.fn('COUNT', Detection.sequelize.col('severity')), 'count']
      ],
      where: baseWhere,
      group: ['severity'],
      raw: true
    });

    // Most common pests
    const commonPests = await Detection.findAll({
      attributes: [
        'pestId',
        [Detection.sequelize.fn('COUNT', Detection.sequelize.col('pestId')), 'count']
      ],
      where: { ...baseWhere, pestId: { [Op.not]: null } },
      group: ['pestId', 'pest.name'],
      include: [{
        model: Pest,
        as: 'pest',
        attributes: ['name', 'type']
      }],
      order: [[Detection.sequelize.fn('COUNT', Detection.sequelize.col('pestId')), 'DESC']],
      limit: 5,
      raw: true
    });

    // Treatment effectiveness
    const treatmentEffectiveness = await TreatmentHistory.findAll({
      attributes: [
        [TreatmentHistory.sequelize.fn('AVG', TreatmentHistory.sequelize.col('effectiveness')), 'avgEffectiveness'],
        [TreatmentHistory.sequelize.fn('COUNT', TreatmentHistory.sequelize.col('id')), 'totalTreatments']
      ],
      where: {
        ...baseWhere,
        effectiveness: { [Op.not]: null }
      },
      raw: true
    });

    // Farms data (role-based)
    let farmsStats = {};
    if (req.user.role === 'farmer') {
      const userFarms = await Farm.count({ where: { userId: req.user.id, isActive: true } });
      farmsStats = { userFarms };
    } else {
      const totalFarms = await Farm.count({ where: { isActive: true } });
      const activeFarms = await Farm.count({
        where: {
          isActive: true,
          id: {
            [Op.in]: Detection.sequelize.literal(`(
              SELECT DISTINCT "farmId" FROM detections 
              WHERE "createdAt" >= '${since.toISOString()}'
            )`)
          }
        }
      });
      farmsStats = { totalFarms, activeFarms };
    }

    res.json({
      period: parseInt(period),
      overview: {
        totalDetections,
        detectionStatus: detectionStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        detectionsBySeverity: detectionsBySeverity.reduce((acc, item) => {
          acc[item.severity] = parseInt(item.count);
          return acc;
        }, {}),
        commonPests: commonPests.map(pest => ({
          pestId: pest.pestId,
          pestName: pest['pest.name'],
          pestType: pest['pest.type'],
          detectionCount: parseInt(pest.count)
        })),
        treatmentEffectiveness: {
          averageEffectiveness: treatmentEffectiveness[0]?.avgEffectiveness ? 
            Math.round(treatmentEffectiveness[0].avgEffectiveness) : null,
          totalTreatments: parseInt(treatmentEffectiveness[0]?.totalTreatments || 0)
        },
        farms: farmsStats
      }
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve overview statistics',
      message: 'Unable to get dashboard overview'
    });
  }
});

// Get trend data for charts
router.get('/trends', authMiddleware, async (req, res) => {
  try {
    const { period = '30', metric = 'detections' } = req.query;
    const { Op } = require('sequelize');
    
    const since = new Date();
    since.setDate(since.getDate() - parseInt(period));
    
    let baseWhere = {
      createdAt: { [Op.gte]: since }
    };

    if (req.user.role === 'farmer') {
      baseWhere.userId = req.user.id;
    }

    let trendData = [];

    switch (metric) {
      case 'detections':
        trendData = await Detection.findAll({
          attributes: [
            [Detection.sequelize.fn('DATE', Detection.sequelize.col('createdAt')), 'date'],
            [Detection.sequelize.fn('COUNT', Detection.sequelize.col('id')), 'count']
          ],
          where: baseWhere,
          group: [Detection.sequelize.fn('DATE', Detection.sequelize.col('createdAt'))],
          order: [[Detection.sequelize.fn('DATE', Detection.sequelize.col('createdAt')), 'ASC']],
          raw: true
        });
        break;

      case 'treatments':
        trendData = await TreatmentHistory.findAll({
          attributes: [
            [TreatmentHistory.sequelize.fn('DATE', TreatmentHistory.sequelize.col('applicationDate')), 'date'],
            [TreatmentHistory.sequelize.fn('COUNT', TreatmentHistory.sequelize.col('id')), 'count']
          ],
          where: {
            applicationDate: { [Op.gte]: since },
            ...(req.user.role === 'farmer' ? { userId: req.user.id } : {})
          },
          group: [TreatmentHistory.sequelize.fn('DATE', TreatmentHistory.sequelize.col('applicationDate'))],
          order: [[TreatmentHistory.sequelize.fn('DATE', TreatmentHistory.sequelize.col('applicationDate')), 'ASC']],
          raw: true
        });
        break;

      default:
        return res.status(400).json({
          error: 'Invalid metric',
          message: 'Metric must be one of: detections, treatments'
        });
    }

    res.json({
      metric,
      period: parseInt(period),
      data: trendData.map(item => ({
        date: item.date,
        value: parseInt(item.count)
      }))
    });
  } catch (error) {
    console.error('Get trend data error:', error);
    res.status(500).json({
      error: 'Failed to retrieve trend data',
      message: 'Unable to get trend information'
    });
  }
});

// Get geographical distribution data
router.get('/geo-distribution', authMiddleware, requireRole('admin', 'technician'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const { Op } = require('sequelize');
    
    const since = new Date();
    since.setDate(since.getDate() - parseInt(period));

    // Get detections with farm locations
    const geoData = await Detection.findAll({
      where: {
        createdAt: { [Op.gte]: since }
      },
      include: [{
        model: Farm,
        as: 'farm',
        attributes: ['id', 'name', 'location', 'area', 'address']
      }, {
        model: Pest,
        as: 'pest',
        attributes: ['name', 'type', 'severity']
      }],
      attributes: ['id', 'severity', 'status', 'createdAt']
    });

    // Group by region (simplified - you might want to use actual administrative divisions)
    const regionData = geoData
      .filter(detection => detection.farm && detection.farm.location)
      .reduce((acc, detection) => {
        const coordinates = detection.farm.location.coordinates;
        const region = determineRegion(coordinates[1], coordinates[0]); // lat, lng
        
        if (!acc[region]) {
          acc[region] = {
            region,
            totalDetections: 0,
            severityBreakdown: {},
            pestTypes: {},
            farms: new Set()
          };
        }
        
        acc[region].totalDetections++;
        acc[region].severityBreakdown[detection.severity] = 
          (acc[region].severityBreakdown[detection.severity] || 0) + 1;
        
        if (detection.pest) {
          acc[region].pestTypes[detection.pest.type] = 
            (acc[region].pestTypes[detection.pest.type] || 0) + 1;
        }
        
        acc[region].farms.add(detection.farm.id);
        
        return acc;
      }, {});

    // Convert Sets to counts
    Object.values(regionData).forEach(region => {
      region.affectedFarms = region.farms.size;
      delete region.farms;
    });

    res.json({
      period: parseInt(period),
      geoDistribution: Object.values(regionData)
    });
  } catch (error) {
    console.error('Get geo distribution error:', error);
    res.status(500).json({
      error: 'Failed to retrieve geographical distribution',
      message: 'Unable to get geographical data'
    });
  }
});

// Get user activity stats (admin only)
router.get('/user-activity', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const { Op } = require('sequelize');
    
    const since = new Date();
    since.setDate(since.getDate() - parseInt(period));

    // Active users (users who made detections)
    const activeUsers = await User.count({
      include: [{
        model: Detection,
        as: 'detections',
        where: {
          createdAt: { [Op.gte]: since }
        }
      }]
    });

    // User activity by role
    const userActivity = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('User.id')), 'totalUsers']
      ],
      include: [{
        model: Detection,
        as: 'detections',
        where: {
          createdAt: { [Op.gte]: since }
        },
        attributes: [],
        required: false
      }],
      group: ['role'],
      raw: true
    });

    // Most active users
    const topUsers = await User.findAll({
      attributes: [
        'id', 'firstName', 'lastName', 'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('detections.id')), 'detectionCount']
      ],
      include: [{
        model: Detection,
        as: 'detections',
        where: {
          createdAt: { [Op.gte]: since }
        },
        attributes: []
      }],
      group: ['User.id', 'User.firstName', 'User.lastName', 'User.role'],
      order: [[User.sequelize.fn('COUNT', User.sequelize.col('detections.id')), 'DESC']],
      limit: 10,
      raw: true
    });

    res.json({
      period: parseInt(period),
      userActivity: {
        activeUsers,
        activityByRole: userActivity.reduce((acc, item) => {
          acc[item.role] = parseInt(item.totalUsers);
          return acc;
        }, {}),
        topUsers: topUsers.map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          detectionCount: parseInt(user.detectionCount)
        }))
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user activity',
      message: 'Unable to get user activity data'
    });
  }
});

// Helper function to determine region based on coordinates (Nicaragua-specific)
function determineRegion(lat, lng) {
  // Simplified region determination for Nicaragua
  if (lat > 14.0) return 'Norte';
  if (lat > 12.5) return 'Central';
  if (lng < -86.0) return 'Pacífico';
  return 'Atlántico';
}

module.exports = router;