const express = require('express');
const { Recommendation, Pest, TreatmentHistory } = require('../models');
const { authMiddleware, requireRole, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get recommendations for a specific pest
router.get('/pest/:pestId', optionalAuth, async (req, res) => {
  try {
    const { category, organic } = req.query;
    
    let recommendations = await Recommendation.findByPest(req.params.pestId);
    
    // Filter by category if specified
    if (category) {
      recommendations = recommendations.filter(rec => rec.category === category);
    }
    
    // Filter organic recommendations if specified
    if (organic === 'true') {
      recommendations = recommendations.filter(rec => rec.organicCompliant);
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      error: 'Failed to retrieve recommendations',
      message: 'Unable to get recommendations'
    });
  }
});

// Get personalized recommendations based on user's farm and conditions
router.post('/personalized', authMiddleware, async (req, res) => {
  try {
    const { pestId, farmId, conditions = {} } = req.body;
    
    // Get base recommendations
    let recommendations = await Recommendation.findByPest(pestId);
    
    // Get user's farm details for personalization
    const { Farm } = require('../models');
    const farm = await Farm.findOne({
      where: { id: farmId, userId: req.user.id }
    });
    
    if (!farm) {
      return res.status(404).json({
        error: 'Farm not found',
        message: 'The specified farm was not found'
      });
    }

    // Get user's treatment history for this pest
    const treatmentHistory = await TreatmentHistory.findAll({
      where: {
        userId: req.user.id,
        farmId: farmId
      },
      include: ['recommendation'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Filter and score recommendations based on:
    // 1. Farm characteristics (soil type, area, etc.)
    // 2. Current conditions (weather, growth stage, etc.)
    // 3. User's treatment history
    // 4. Seasonal appropriateness
    
    const scoredRecommendations = recommendations.map(rec => {
      let score = rec.effectiveness || 50;
      
      // Adjust score based on farm size (some treatments better for larger/smaller farms)
      if (farm.area < 1 && rec.category === 'chemical') {
        score -= 10; // Prefer non-chemical for small farms
      }
      
      // Adjust based on environmental conditions
      if (conditions.rainfall > 50 && rec.category === 'chemical') {
        score -= 15; // Chemical treatments less effective in high rainfall
      }
      
      // Boost score for organic if user has history of organic treatments
      const organicHistory = treatmentHistory.filter(th => 
        th.recommendation && th.recommendation.organicCompliant
      ).length;
      
      if (organicHistory > 0 && rec.organicCompliant) {
        score += 10;
      }
      
      // Check seasonal appropriateness
      const currentMonth = new Date().getMonth() + 1;
      if (rec.isApplicableInSeason(currentMonth)) {
        score += 5;
      } else {
        score -= 10;
      }
      
      return {
        ...rec.toJSON(),
        personalizedScore: Math.max(0, Math.min(100, score)),
        farmSpecific: {
          estimatedCost: rec.calculateCostForArea(farm.area),
          areaAdjusted: true
        }
      };
    });

    // Sort by personalized score
    scoredRecommendations.sort((a, b) => b.personalizedScore - a.personalizedScore);

    res.json({
      recommendations: scoredRecommendations,
      farm: {
        id: farm.id,
        name: farm.name,
        area: farm.area
      },
      personalizationFactors: {
        farmSize: farm.area,
        treatmentHistory: treatmentHistory.length,
        conditions
      }
    });
  } catch (error) {
    console.error('Get personalized recommendations error:', error);
    res.status(500).json({
      error: 'Failed to get personalized recommendations',
      message: 'Unable to generate personalized recommendations'
    });
  }
});

// Record treatment application
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const {
      recommendationId,
      farmId,
      detectionId,
      productUsed,
      dosage,
      applicationMethod,
      areaTreated,
      applicationDate,
      weatherConditions,
      cost,
      notes
    } = req.body;

    // Verify farm ownership
    const { Farm } = require('../models');
    const farm = await Farm.findOne({
      where: { id: farmId, userId: req.user.id }
    });

    if (!farm) {
      return res.status(404).json({
        error: 'Farm not found',
        message: 'The specified farm was not found'
      });
    }

    // Get recommendation details
    const recommendation = await Recommendation.findByPk(recommendationId);
    if (!recommendation) {
      return res.status(404).json({
        error: 'Recommendation not found',
        message: 'The specified recommendation was not found'
      });
    }

    // Create treatment history record
    const treatment = await TreatmentHistory.create({
      treatmentType: recommendation.category,
      productUsed,
      dosage,
      applicationMethod,
      areaTreated: areaTreated || farm.area,
      applicationDate: applicationDate || new Date(),
      weatherConditions: weatherConditions || {},
      cost: cost || 0,
      notes,
      userId: req.user.id,
      farmId,
      detectionId,
      recommendationId
    });

    // Update detection status if provided
    if (detectionId) {
      const { Detection } = require('../models');
      await Detection.update(
        { treatmentApplied: true },
        { where: { id: detectionId, userId: req.user.id } }
      );
    }

    const treatmentWithDetails = await TreatmentHistory.findByPk(treatment.id, {
      include: ['recommendation', 'farm', 'detection']
    });

    res.status(201).json({
      message: 'Treatment application recorded successfully',
      treatment: treatmentWithDetails
    });
  } catch (error) {
    console.error('Record treatment error:', error);
    res.status(500).json({
      error: 'Failed to record treatment',
      message: 'Unable to record treatment application'
    });
  }
});

// Get treatment history for user
router.get('/treatments', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, farmId, category } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { userId: req.user.id };
    if (farmId) where.farmId = farmId;
    if (category) where.treatmentType = category;

    const treatments = await TreatmentHistory.findAndCountAll({
      where,
      include: ['recommendation', 'farm', 'detection'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['applicationDate', 'DESC']]
    });

    res.json({
      treatments: treatments.rows,
      total: treatments.count,
      page: parseInt(page),
      pages: Math.ceil(treatments.count / limit)
    });
  } catch (error) {
    console.error('Get treatments error:', error);
    res.status(500).json({
      error: 'Failed to retrieve treatments',
      message: 'Unable to get treatment history'
    });
  }
});

// Update treatment effectiveness (post-application feedback)
router.put('/treatments/:id/effectiveness', authMiddleware, async (req, res) => {
  try {
    const { effectiveness, sideEffects, followUpRequired, followUpDate, notes } = req.body;
    
    const treatment = await TreatmentHistory.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!treatment) {
      return res.status(404).json({
        error: 'Treatment not found',
        message: 'The requested treatment record was not found'
      });
    }

    await treatment.update({
      effectiveness,
      sideEffects: sideEffects || [],
      followUpRequired: followUpRequired || false,
      followUpDate,
      notes: notes || treatment.notes
    });

    res.json({
      message: 'Treatment effectiveness updated successfully',
      treatment
    });
  } catch (error) {
    console.error('Update treatment effectiveness error:', error);
    res.status(500).json({
      error: 'Failed to update treatment effectiveness',
      message: 'Unable to update treatment record'
    });
  }
});

// Create new recommendation (admin/technician)
router.post('/', authMiddleware, requireRole('admin', 'technician'), async (req, res) => {
  try {
    const recommendation = await Recommendation.create(req.body);
    
    res.status(201).json({
      message: 'Recommendation created successfully',
      recommendation
    });
  } catch (error) {
    console.error('Create recommendation error:', error);
    res.status(500).json({
      error: 'Failed to create recommendation',
      message: 'Unable to create recommendation'
    });
  }
});

module.exports = router;