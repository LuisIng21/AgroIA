module.exports = (sequelize, DataTypes) => {
  const WeatherData = sequelize.define('WeatherData', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    temperature: {
      type: DataTypes.DECIMAL(5, 2),
      comment: 'Temperature in Celsius'
    },
    humidity: {
      type: DataTypes.DECIMAL(5, 2),
      comment: 'Relative humidity percentage'
    },
    rainfall: {
      type: DataTypes.DECIMAL(6, 2),
      comment: 'Rainfall in millimeters'
    },
    windSpeed: {
      type: DataTypes.DECIMAL(5, 2),
      comment: 'Wind speed in km/h'
    },
    windDirection: {
      type: DataTypes.INTEGER,
      comment: 'Wind direction in degrees'
    },
    pressure: {
      type: DataTypes.DECIMAL(7, 2),
      comment: 'Atmospheric pressure in hPa'
    },
    uvIndex: {
      type: DataTypes.DECIMAL(3, 1),
      comment: 'UV index'
    },
    soilMoisture: {
      type: DataTypes.DECIMAL(5, 2),
      comment: 'Soil moisture percentage'
    },
    leafWetness: {
      type: DataTypes.DECIMAL(5, 2),
      comment: 'Leaf wetness duration in hours'
    },
    recordedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    source: {
      type: DataTypes.ENUM,
      values: ['sensor', 'api', 'manual'],
      defaultValue: 'api'
    },
    farmId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'farms',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'weather_data',
    timestamps: false
  });

  return WeatherData;
};