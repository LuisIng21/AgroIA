module.exports = (sequelize, DataTypes) => {
  const Farm = sequelize.define('Farm', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT
    },
    area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Area in hectares'
    },
    soilType: {
      type: DataTypes.ENUM,
      values: ['clay', 'sandy', 'loam', 'silt', 'rocky', 'other'],
      defaultValue: 'loam'
    },
    elevation: {
      type: DataTypes.INTEGER,
      comment: 'Elevation in meters above sea level'
    },
    beanVariety: {
      type: DataTypes.STRING,
      allowNull: false
    },
    plantingDate: {
      type: DataTypes.DATE
    },
    harvestDate: {
      type: DataTypes.DATE
    },
    irrigationType: {
      type: DataTypes.ENUM,
      values: ['rain-fed', 'drip', 'sprinkler', 'flood', 'manual'],
      defaultValue: 'rain-fed'
    },
    previousCrops: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    fertilizationPlan: {
      type: DataTypes.JSONB,
      defaultValue: {
        organic: [],
        chemical: [],
        schedule: []
      }
    },
    pestManagementHistory: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    notes: {
      type: DataTypes.TEXT
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'farms',
    timestamps: true
  });

  // Instance methods
  Farm.prototype.getCoordinates = function() {
    if (this.location && this.location.coordinates) {
      return {
        longitude: this.location.coordinates[0],
        latitude: this.location.coordinates[1]
      };
    }
    return null;
  };

  Farm.prototype.calculateGrowthStage = function() {
    if (!this.plantingDate) return null;
    
    const now = new Date();
    const planted = new Date(this.plantingDate);
    const daysSincePlanting = Math.floor((now - planted) / (1000 * 60 * 60 * 24));
    
    if (daysSincePlanting < 0) return 'not-planted';
    if (daysSincePlanting <= 7) return 'germination';
    if (daysSincePlanting <= 21) return 'seedling';
    if (daysSincePlanting <= 35) return 'vegetative';
    if (daysSincePlanting <= 50) return 'flowering';
    if (daysSincePlanting <= 70) return 'pod-development';
    if (daysSincePlanting <= 90) return 'pod-filling';
    if (daysSincePlanting <= 110) return 'maturity';
    return 'harvest-ready';
  };

  // Class methods
  Farm.findByUser = function(userId) {
    return this.findAll({
      where: { userId, isActive: true },
      order: [['name', 'ASC']]
    });
  };

  Farm.findNearby = function(latitude, longitude, radiusKm = 10) {
    const { literal } = require('sequelize');
    return this.findAll({
      where: literal(`ST_DWithin(location, ST_Point(${longitude}, ${latitude}), ${radiusKm * 1000})`),
      order: literal(`ST_Distance(location, ST_Point(${longitude}, ${latitude}))`)
    });
  };

  Farm.findByBeanVariety = function(variety) {
    return this.findAll({
      where: { beanVariety: variety, isActive: true },
      order: [['name', 'ASC']]
    });
  };

  return Farm;
};