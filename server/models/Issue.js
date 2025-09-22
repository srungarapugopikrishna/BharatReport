const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Issue = sequelize.define('Issue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  issueId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Human-readable ID like JR-2024-001
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'verified', 'closed'),
    defaultValue: 'open'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  location: {
    type: DataTypes.JSONB, // Store lat, lng, address, ward, district
    allowNull: false
  },
  media: {
    type: DataTypes.ARRAY(DataTypes.TEXT), // Array of file URLs (TEXT for long data URLs)
    defaultValue: []
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  upvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // For anonymous reports
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  subcategoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Subcategories',
      key: 'id'
    }
  },
  assignedOfficials: {
    type: DataTypes.ARRAY(DataTypes.UUID), // Array of official IDs
    defaultValue: []
  },
  assignedAuthorityId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Authorities',
      key: 'id'
    }
  },
  resolutionNotes: {
    type: DataTypes.TEXT
  },
  resolutionMedia: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  resolvedAt: {
    type: DataTypes.DATE
  },
  verifiedAt: {
    type: DataTypes.DATE
  },
  escalatedAt: {
    type: DataTypes.DATE
  },
  escalatedTo: {
    type: DataTypes.UUID,
    references: {
      model: 'Officials',
      key: 'id'
    }
  }
}, {
  indexes: [
    {
      fields: ['location']
    },
    {
      fields: ['status']
    },
    {
      fields: ['categoryId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Issue;
