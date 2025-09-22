const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isOfficial: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isInternal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // Internal notes not visible to public
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
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  officialId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Officials',
      key: 'id'
    }
  }
});

module.exports = Comment;
