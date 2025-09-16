const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 255]
      }
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[+]?[0-9\s\-()]+$/
      }
    },
    role: {
      type: DataTypes.ENUM,
      values: ['farmer', 'technician', 'admin'],
      defaultValue: 'farmer',
      allowNull: false
    },
    profileImage: {
      type: DataTypes.STRING
    },
    location: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        language: 'es',
        units: 'metric'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: {
      type: DataTypes.STRING
    },
    resetPasswordToken: {
      type: DataTypes.STRING
    },
    resetPasswordExpires: {
      type: DataTypes.DATE
    },
    lastLoginAt: {
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
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.verificationToken;
    delete values.resetPasswordToken;
    delete values.resetPasswordExpires;
    return values;
  };

  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  User.prototype.updateLastLogin = function() {
    this.lastLoginAt = new Date();
    return this.save();
  };

  // Class methods
  User.findByEmail = function(email) {
    return this.findOne({ where: { email } });
  };

  User.findActiveUsers = function() {
    return this.findAll({ where: { isActive: true } });
  };

  User.findByRole = function(role) {
    return this.findAll({ where: { role, isActive: true } });
  };

  return User;
};