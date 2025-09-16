module.exports = (sequelize, DataTypes) => {
  const TreatmentHistory = sequelize.define('TreatmentHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    treatmentType: {
      type: DataTypes.ENUM,
      values: ['prevention', 'treatment', 'cultural', 'biological', 'chemical', 'integrated'],
      allowNull: false
    },
    productUsed: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dosage: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    applicationMethod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    areaTreated: {
      type: DataTypes.DECIMAL(10, 2),
      comment: 'Area treated in hectares'
    },
    applicationDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    weatherConditions: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    effectiveness: {
      type: DataTypes.INTEGER,
      validate: { min: 0, max: 100 },
      comment: 'Effectiveness rating (0-100)'
    },
    sideEffects: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    followUpRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpDate: {
      type: DataTypes.DATE
    },
    notes: {
      type: DataTypes.TEXT
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
    detectionId: {
      type: DataTypes.UUID,
      references: {
        model: 'detections',
        key: 'id'
      }
    },
    recommendationId: {
      type: DataTypes.UUID,
      references: {
        model: 'recommendations',
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
    tableName: 'treatment_history',
    timestamps: true
  });

  return TreatmentHistory;
};