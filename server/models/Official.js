const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Official = sequelize.define('Official', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  jurisdiction: {
    type: DataTypes.JSONB, // Store area/ward/district info
    allowNull: false
  },
  categories: {
    type: DataTypes.ARRAY(DataTypes.UUID), // Categories this official handles
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  responseTime: {
    type: DataTypes.INTEGER, // Average response time in hours
    defaultValue: 0
  },
  resolutionRate: {
    type: DataTypes.FLOAT, // Percentage of issues resolved
    defaultValue: 0
  }
});

module.exports = Official;
