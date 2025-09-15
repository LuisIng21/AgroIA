module.exports = (sequelize, DataTypes) => {
  const Detection = sequelize.define('Detection', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    originalFileName: {
      type: DataTypes.STRING
    },
    aiPrediction: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        predictions: [],
        confidence: 0,
        processingTime: 0
      }
    },
    confirmedPestId: {
      type: DataTypes.UUID,
      references: {
        model: 'pests',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM,
      values: ['pending', 'confirmed', 'false_positive', 'under_review'],
      defaultValue: 'pending'
    },
    severity: {
      type: DataTypes.ENUM,
      values: ['low', 'medium', 'high', 'critical'],
      allowNull: false
    },
    affectedArea: {
      type: DataTypes.DECIMAL(5, 2),
      comment: 'Percentage of affected area (0-100)'
    },
    symptoms: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    environmentalConditions: {
      type: DataTypes.JSONB,
      defaultValue: {
        temperature: null,
        humidity: null,
        rainfall: null,
        windSpeed: null
      }
    },
    location: {
      type: DataTypes.GEOMETRY('POINT')
    },
    notes: {
      type: DataTypes.TEXT
    },
    treatmentApplied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpDate: {
      type: DataTypes.DATE
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    farmId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'farms',
        key: 'id'
      }
    },
    pestId: {
      type: DataTypes.UUID,
      references: {
        model: 'pests',
        key: 'id'
      }
    },
    verifiedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    verifiedAt: {
      type: DataTypes.DATE
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
    tableName: 'detections',
    timestamps: true
  });

  // Instance methods
  Detection.prototype.getConfidence = function() {
    return this.aiPrediction?.confidence || 0;
  };

  Detection.prototype.getTopPrediction = function() {
    const predictions = this.aiPrediction?.predictions || [];
    return predictions.length > 0 ? predictions[0] : null;
  };

  Detection.prototype.requiresExpertReview = function() {
    const confidence = this.getConfidence();
    return confidence < 0.7 || this.severity === 'critical';
  };

  Detection.prototype.markAsConfirmed = function(pestId, verifiedBy) {
    this.status = 'confirmed';
    this.confirmedPestId = pestId;
    this.verifiedBy = verifiedBy;
    this.verifiedAt = new Date();
    return this.save();
  };

  // Class methods
  Detection.findByUser = function(userId) {
    return this.findAll({
      where: { userId },
      include: ['pest', 'farm'],
      order: [['createdAt', 'DESC']]
    });
  };

  Detection.findByFarm = function(farmId) {
    return this.findAll({
      where: { farmId },
      include: ['pest', 'user'],
      order: [['createdAt', 'DESC']]
    });
  };

  Detection.findPendingReview = function() {
    return this.findAll({
      where: { status: 'pending' },
      include: ['pest', 'farm', 'user'],
      order: [['createdAt', 'ASC']]
    });
  };

  Detection.findBySeverity = function(severity) {
    return this.findAll({
      where: { severity },
      include: ['pest', 'farm', 'user'],
      order: [['createdAt', 'DESC']]
    });
  };

  Detection.findRecent = function(days = 7) {
    const { Op } = require('sequelize');
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    return this.findAll({
      where: {
        createdAt: { [Op.gte]: since }
      },
      include: ['pest', 'farm', 'user'],
      order: [['createdAt', 'DESC']]
    });
  };

  return Detection;
};