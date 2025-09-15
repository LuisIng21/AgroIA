const express = require('express');
const { Farm, Detection, WeatherData } = require('../models');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get farms for user with location data
router.get('/farms', authMiddleware, async (req, res) => {
  try {
    const farms = await Farm.findByUser(req.user.id);
    
    const farmsWithCoordinates = farms.map(farm => ({
      ...farm.toJSON(),
      coordinates: farm.getCoordinates(),
      growthStage: farm.calculateGrowthStage()
    }));

    res.json({ farms: farmsWithCoordinates });
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({
      error: 'Failed to retrieve farms',
      message: 'Unable to get farm locations'
    });
  }
});

// Create new farm with geolocation
router.post('/farms', authMiddleware, async (req, res) => {
  try {
    const { name, latitude, longitude, address, area, ...farmData } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Coordinates required',
        message: 'Latitude and longitude are required'
      });
    }

    const farm = await Farm.create({
      name,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      address,
      area,
      userId: req.user.id,
      ...farmData
    });

    res.status(201).json({
      message: 'Farm created successfully',
      farm: {
        ...farm.toJSON(),
        coordinates: farm.getCoordinates()
      }
    });
  } catch (error) {
    console.error('Create farm error:', error);
    res.status(500).json({
      error: 'Failed to create farm',
      message: 'Unable to create farm location'
    });
  }
});

// Find nearby farms (for technicians to see farms in their area)
router.get('/nearby', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Coordinates required',
        message: 'Latitude and longitude are required'
      });
    }

    let farms;
    if (req.user.role === 'admin' || req.user.role === 'technician') {
      // Technicians and admins can see all nearby farms
      farms = await Farm.findNearby(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );
    } else {
      // Farmers can only see their own farms
      farms = await Farm.findByUser(req.user.id);
    }

    const farmsWithDetails = farms.map(farm => ({
      ...farm.toJSON(),
      coordinates: farm.getCoordinates(),
      distance: calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        farm.getCoordinates()?.latitude,
        farm.getCoordinates()?.longitude
      )
    }));

    res.json({ farms: farmsWithDetails });
  } catch (error) {
    console.error('Find nearby farms error:', error);
    res.status(500).json({
      error: 'Failed to find nearby farms',
      message: 'Unable to search for nearby farms'
    });
  }
});

// Get pest incidence map data
router.get('/pest-map', optionalAuth, async (req, res) => {
  try {
    const { pestId, days = 30, severity } = req.query;
    const { Op } = require('sequelize');
    
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));
    
    const where = {
      createdAt: { [Op.gte]: since },
      status: { [Op.in]: ['confirmed', 'pending'] }
    };
    
    if (pestId) where.pestId = pestId;
    if (severity) where.severity = severity;

    const detections = await Detection.findAll({
      where,
      include: [
        {
          model: Farm,
          as: 'farm',
          attributes: ['id', 'name', 'location', 'area']
        },
        {
          model: require('../models').Pest,
          as: 'pest',
          attributes: ['id', 'name', 'type', 'severity']
        }
      ],
      attributes: ['id', 'severity', 'createdAt', 'status']
    });

    // Group detections by location
    const mapData = detections
      .filter(detection => detection.farm && detection.farm.location)
      .map(detection => {
        const coordinates = detection.farm.location?.coordinates || [0, 0];
        return {
          id: detection.id,
          latitude: coordinates[1],
          longitude: coordinates[0],
          severity: detection.severity,
          pestName: detection.pest?.name || 'Unknown',
          pestType: detection.pest?.type || 'unknown',
          farmName: detection.farm.name,
          farmArea: detection.farm.area,
          detectedAt: detection.createdAt,
          status: detection.status
        };
      });

    res.json({
      mapData,
      summary: {
        totalDetections: mapData.length,
        severityBreakdown: mapData.reduce((acc, item) => {
          acc[item.severity] = (acc[item.severity] || 0) + 1;
          return acc;
        }, {}),
        pestTypeBreakdown: mapData.reduce((acc, item) => {
          acc[item.pestType] = (acc[item.pestType] || 0) + 1;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get pest map error:', error);
    res.status(500).json({
      error: 'Failed to get pest map data',
      message: 'Unable to retrieve pest incidence map'
    });
  }
});

// Get weather data for farm
router.get('/farms/:farmId/weather', authMiddleware, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const { Op } = require('sequelize');
    
    // Verify farm ownership
    const farm = await Farm.findOne({
      where: { 
        id: req.params.farmId,
        [Op.or]: [
          { userId: req.user.id },
          // Allow technicians and admins to access any farm
          ...(req.user.role !== 'farmer' ? [{}] : [])
        ]
      }
    });

    if (!farm) {
      return res.status(404).json({
        error: 'Farm not found',
        message: 'The requested farm was not found'
      });
    }

    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const weatherData = await WeatherData.findAll({
      where: {
        farmId: req.params.farmId,
        recordedAt: { [Op.gte]: since }
      },
      order: [['recordedAt', 'DESC']]
    });

    // If no weather data exists, simulate some basic data
    if (weatherData.length === 0) {
      const simulatedData = generateSimulatedWeatherData(farm, days);
      res.json({
        weatherData: simulatedData,
        isSimulated: true,
        message: 'Showing simulated weather data'
      });
    } else {
      res.json({ 
        weatherData,
        isSimulated: false
      });
    }
  } catch (error) {
    console.error('Get weather data error:', error);
    res.status(500).json({
      error: 'Failed to get weather data',
      message: 'Unable to retrieve weather information'
    });
  }
});

// Update farm location
router.put('/farms/:farmId/location', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    
    const farm = await Farm.findOne({
      where: { id: req.params.farmId, userId: req.user.id }
    });

    if (!farm) {
      return res.status(404).json({
        error: 'Farm not found',
        message: 'The requested farm was not found'
      });
    }

    const updates = {};
    if (latitude && longitude) {
      updates.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
    }
    if (address) updates.address = address;

    await farm.update(updates);

    res.json({
      message: 'Farm location updated successfully',
      farm: {
        ...farm.toJSON(),
        coordinates: farm.getCoordinates()
      }
    });
  } catch (error) {
    console.error('Update farm location error:', error);
    res.status(500).json({
      error: 'Failed to update farm location',
      message: 'Unable to update farm location'
    });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in kilometers
  return Math.round(d * 100) / 100;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Generate simulated weather data for demonstration
function generateSimulatedWeatherData(farm, days) {
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simulate typical Nicaragua weather patterns
    data.push({
      id: `sim_${i}`,
      temperature: 25 + Math.random() * 10,
      humidity: 60 + Math.random() * 30,
      rainfall: Math.random() < 0.3 ? Math.random() * 20 : 0,
      windSpeed: 5 + Math.random() * 15,
      windDirection: Math.floor(Math.random() * 360),
      pressure: 1013 + (Math.random() - 0.5) * 20,
      uvIndex: 8 + Math.random() * 4,
      recordedAt: date,
      source: 'simulated',
      farmId: farm.id
    });
  }
  
  return data.reverse(); // Return in chronological order
}

module.exports = router;