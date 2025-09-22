const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Authority = sequelize.define('Authority', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  level: {
    type: DataTypes.ENUM('MP', 'MLA', 'Mayor', 'Corporator', 'Ward Member', 'Engineer', 'Contractor', 'Supervisor', 'Other'),
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
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
    type: DataTypes.JSONB, // Store area/ward/district/constituency info
    allowNull: false
  },
  categories: {
    type: DataTypes.ARRAY(DataTypes.UUID), // Categories this authority handles
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
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Authority;
