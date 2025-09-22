const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
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
  nameHindi: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nameTelugu: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT
  },
  icon: {
    type: DataTypes.STRING
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3B82F6'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Category;
