module.exports = (sequelize, DataTypes) => {
  const Recommendation = sequelize.define('Recommendation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM,
      values: ['prevention', 'treatment', 'cultural', 'biological', 'chemical', 'integrated'],
      allowNull: false
    },
    urgency: {
      type: DataTypes.ENUM,
      values: ['low', 'medium', 'high', 'immediate'],
      defaultValue: 'medium'
    },
    steps: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    materials: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    dosage: {
      type: DataTypes.JSONB,
      defaultValue: {
        amount: null,
        unit: null,
        frequency: null,
        duration: null
      }
    },
    timing: {
      type: DataTypes.JSONB,
      defaultValue: {
        bestTime: null,
        weatherConditions: [],
        growthStage: []
      }
    },
    cost: {
      type: DataTypes.JSONB,
      defaultValue: {
        estimated: 0,
        currency: 'NIO',
        perHectare: true
      }
    },
    effectiveness: {
      type: DataTypes.INTEGER,
      validate: { min: 0, max: 100 },
      comment: 'Effectiveness percentage (0-100)'
    },
    safetyPrecautions: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    environmentalImpact: {
      type: DataTypes.ENUM,
      values: ['very_low', 'low', 'medium', 'high', 'very_high'],
      defaultValue: 'low'
    },
    organicCompliant: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpActions: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    references: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    applicableRegions: {
      type: DataTypes.JSONB,
      defaultValue: ['nicaragua']
    },
    seasonality: {
      type: DataTypes.JSONB,
      defaultValue: {
        months: [],
        conditions: []
      }
    },
    pestId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pests',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    tableName: 'recommendations',
    timestamps: true
  });

  // Instance methods
  Recommendation.prototype.calculateCostForArea = function(hectares) {
    if (this.cost && this.cost.estimated) {
      return this.cost.perHectare ? this.cost.estimated * hectares : this.cost.estimated;
    }
    return 0;
  };

  Recommendation.prototype.isApplicableInSeason = function(month) {
    if (!this.seasonality || !this.seasonality.months) return true;
    return this.seasonality.months.length === 0 || this.seasonality.months.includes(month);
  };

  // Class methods
  Recommendation.findByPest = function(pestId) {
    return this.findAll({
      where: { pestId, isActive: true },
      order: [['effectiveness', 'DESC'], ['urgency', 'DESC']]
    });
  };

  Recommendation.findByCategory = function(category) {
    return this.findAll({
      where: { category, isActive: true },
      include: ['pest'],
      order: [['effectiveness', 'DESC']]
    });
  };

  Recommendation.findOrganic = function() {
    return this.findAll({
      where: { organicCompliant: true, isActive: true },
      include: ['pest'],
      order: [['effectiveness', 'DESC']]
    });
  };

  Recommendation.findByUrgency = function(urgency) {
    return this.findAll({
      where: { urgency, isActive: true },
      include: ['pest'],
      order: [['effectiveness', 'DESC']]
    });
  };

  return Recommendation;
};