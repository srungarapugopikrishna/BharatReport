const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Upvote = sequelize.define('Upvote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  issueId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Issues',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // For anonymous upvotes
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true // For anonymous upvotes
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['issueId', 'userId']
    },
    {
      unique: true,
      fields: ['issueId', 'ipAddress']
    }
  ]
});

module.exports = Upvote;
