module.exports = (sequelize, DataTypes) => {
  const Pest = sequelize.define('Pest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    scientificName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      values: ['disease', 'insect', 'weed', 'nutritional', 'environmental'],
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM,
      values: ['low', 'medium', 'high', 'critical'],
      defaultValue: 'medium'
    },
    description: {
      type: DataTypes.TEXT
    },
    symptoms: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    causes: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    affectedParts: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    seasonality: {
      type: DataTypes.JSONB,
      defaultValue: {
        months: [],
        conditions: []
      }
    },
    preventionMethods: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    culturalControl: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    biologicalControl: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    chemicalControl: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    economicImpact: {
      type: DataTypes.JSONB,
      defaultValue: {
        yieldLoss: 0,
        costPerHectare: 0
      }
    },
    images: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    references: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    aiModelClasses: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Classes from PlantVillage model that correspond to this pest'
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
    tableName: 'pests',
    timestamps: true
  });

  // Class methods
  Pest.findByType = function(type) {
    return this.findAll({ 
      where: { type, isActive: true },
      order: [['name', 'ASC']]
    });
  };

  Pest.findBySeverity = function(severity) {
    return this.findAll({ 
      where: { severity, isActive: true },
      order: [['name', 'ASC']]
    });
  };

  Pest.searchByName = function(searchTerm) {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { scientificName: { [Op.iLike]: `%${searchTerm}%` } }
        ],
        isActive: true
      },
      order: [['name', 'ASC']]
    });
  };

  Pest.findByAiClass = function(aiClass) {
    const { Op } = require('sequelize');
    return this.findAll({
      where: {
        aiModelClasses: {
          [Op.contains]: [aiClass]
        },
        isActive: true
      }
    });
  };

  return Pest;
};