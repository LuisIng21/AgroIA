const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    ssl: dbConfig.ssl
  }
);

// Import models
const User = require('./user')(sequelize, Sequelize.DataTypes);
const Pest = require('./pest')(sequelize, Sequelize.DataTypes);
const Detection = require('./detection')(sequelize, Sequelize.DataTypes);
const Recommendation = require('./recommendation')(sequelize, Sequelize.DataTypes);
const Farm = require('./farm')(sequelize, Sequelize.DataTypes);
const TreatmentHistory = require('./treatmentHistory')(sequelize, Sequelize.DataTypes);
const WeatherData = require('./weatherData')(sequelize, Sequelize.DataTypes);

// Define associations
const models = {
  User,
  Pest,
  Detection,
  Recommendation,
  Farm,
  TreatmentHistory,
  WeatherData,
  sequelize
};

// User associations
User.hasMany(Farm, { foreignKey: 'userId', as: 'farms' });
User.hasMany(Detection, { foreignKey: 'userId', as: 'detections' });
User.hasMany(TreatmentHistory, { foreignKey: 'userId', as: 'treatments' });

// Farm associations
Farm.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
Farm.hasMany(Detection, { foreignKey: 'farmId', as: 'detections' });
Farm.hasMany(TreatmentHistory, { foreignKey: 'farmId', as: 'treatments' });
Farm.hasMany(WeatherData, { foreignKey: 'farmId', as: 'weather' });

// Pest associations
Pest.hasMany(Detection, { foreignKey: 'pestId', as: 'detections' });
Pest.hasMany(Recommendation, { foreignKey: 'pestId', as: 'recommendations' });

// Detection associations
Detection.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Detection.belongsTo(Farm, { foreignKey: 'farmId', as: 'farm' });
Detection.belongsTo(Pest, { foreignKey: 'pestId', as: 'pest' });
Detection.hasMany(TreatmentHistory, { foreignKey: 'detectionId', as: 'treatments' });

// Recommendation associations
Recommendation.belongsTo(Pest, { foreignKey: 'pestId', as: 'pest' });
Recommendation.hasMany(TreatmentHistory, { foreignKey: 'recommendationId', as: 'applications' });

// Treatment History associations
TreatmentHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
TreatmentHistory.belongsTo(Farm, { foreignKey: 'farmId', as: 'farm' });
TreatmentHistory.belongsTo(Detection, { foreignKey: 'detectionId', as: 'detection' });
TreatmentHistory.belongsTo(Recommendation, { foreignKey: 'recommendationId', as: 'recommendation' });

// Weather Data associations
WeatherData.belongsTo(Farm, { foreignKey: 'farmId', as: 'farm' });

module.exports = models;