const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { Detection, Pest, Farm } = require('../models');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// AI Service simulation (replace with actual AI service call)
const simulateAIAnalysis = async (imageBuffer) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate AI predictions based on PlantVillage dataset
  const predictions = [
    {
      pestName: 'Bean Rust',
      scientificName: 'Uromyces appendiculatus',
      confidence: 0.85,
      severity: 'medium',
      type: 'disease'
    },
    {
      pestName: 'Bacterial Blight',
      scientificName: 'Xanthomonas campestris',
      confidence: 0.72,
      severity: 'high',
      type: 'disease'
    },
    {
      pestName: 'Healthy Bean',
      scientificName: 'Phaseolus vulgaris',
      confidence: 0.15,
      severity: 'low',
      type: 'healthy'
    }
  ];

  return {
    predictions,
    confidence: predictions[0].confidence,
    processingTime: 1.2
  };
};

// Process image and analyze for pests
router.post('/analyze', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please upload an image for analysis'
      });
    }

    const { farmId, notes, environmentalConditions } = req.body;

    // Validate farm ownership
    const farm = await Farm.findOne({
      where: { id: farmId, userId: req.user.id }
    });

    if (!farm) {
      return res.status(404).json({
        error: 'Farm not found',
        message: 'The specified farm does not exist or you do not have access to it'
      });
    }

    // Process image
    const filename = `detection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    const imagePath = path.join(__dirname, '../uploads', filename);
    
    await sharp(req.file.buffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(imagePath);

    // Analyze image with AI
    const aiPrediction = await simulateAIAnalysis(req.file.buffer);

    // Find matching pest in database
    let pestId = null;
    const topPrediction = aiPrediction.predictions[0];
    
    if (topPrediction.confidence > 0.5 && topPrediction.type !== 'healthy') {
      const pest = await Pest.findOne({
        where: {
          name: { [Pest.sequelize.Op.iLike]: `%${topPrediction.pestName}%` }
        }
      });
      if (pest) pestId = pest.id;
    }

    // Create detection record
    const detection = await Detection.create({
      imageUrl: `/uploads/${filename}`,
      originalFileName: req.file.originalname,
      aiPrediction,
      pestId,
      severity: topPrediction.severity,
      userId: req.user.id,
      farmId,
      notes,
      environmentalConditions: environmentalConditions ? JSON.parse(environmentalConditions) : {},
      followUpRequired: aiPrediction.confidence < 0.7 || topPrediction.severity === 'high'
    });

    // Include related data in response
    const detectionWithDetails = await Detection.findByPk(detection.id, {
      include: ['pest', 'farm']
    });

    res.status(201).json({
      message: 'Image analyzed successfully',
      detection: detectionWithDetails,
      recommendations: pestId ? await getRecommendationsForPest(pestId) : []
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: 'Unable to analyze the image'
    });
  }
});

// Get detection history for user
router.get('/detections', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, farmId, status, severity } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { userId: req.user.id };
    if (farmId) where.farmId = farmId;
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const detections = await Detection.findAndCountAll({
      where,
      include: ['pest', 'farm'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      detections: detections.rows,
      total: detections.count,
      page: parseInt(page),
      pages: Math.ceil(detections.count / limit)
    });
  } catch (error) {
    console.error('Get detections error:', error);
    res.status(500).json({
      error: 'Failed to retrieve detections',
      message: 'Unable to get detection history'
    });
  }
});

// Get specific detection
router.get('/detections/:id', authMiddleware, async (req, res) => {
  try {
    const detection = await Detection.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: ['pest', 'farm', 'treatments']
    });

    if (!detection) {
      return res.status(404).json({
        error: 'Detection not found',
        message: 'The requested detection does not exist'
      });
    }

    res.json({ detection });
  } catch (error) {
    console.error('Get detection error:', error);
    res.status(500).json({
      error: 'Failed to retrieve detection',
      message: 'Unable to get detection details'
    });
  }
});

// Update detection status (for technicians/admins)
router.put('/detections/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, confirmedPestId, notes } = req.body;
    
    const detection = await Detection.findByPk(req.params.id, {
      include: ['farm']
    });

    if (!detection) {
      return res.status(404).json({
        error: 'Detection not found',
        message: 'The requested detection does not exist'
      });
    }

    // Check permissions
    if (req.user.role === 'farmer' && detection.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'You can only update your own detections'
      });
    }

    const updates = { status };
    if (confirmedPestId) updates.confirmedPestId = confirmedPestId;
    if (notes) updates.notes = notes;
    if (status === 'confirmed') {
      updates.verifiedBy = req.user.id;
      updates.verifiedAt = new Date();
    }

    await detection.update(updates);

    const updatedDetection = await Detection.findByPk(detection.id, {
      include: ['pest', 'farm']
    });

    res.json({
      message: 'Detection status updated successfully',
      detection: updatedDetection
    });
  } catch (error) {
    console.error('Update detection error:', error);
    res.status(500).json({
      error: 'Failed to update detection',
      message: 'Unable to update detection status'
    });
  }
});

// Helper function to get recommendations
async function getRecommendationsForPest(pestId) {
  const { Recommendation } = require('../models');
  return await Recommendation.findByPest(pestId);
}

module.exports = router;