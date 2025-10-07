const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Subcategory = require('./Subcategory');
const Official = require('./Official');
const Authority = require('./Authority');
const Issue = require('./Issue');
const Comment = require('./Comment');
const Upvote = require('./Upvote');
const AuditLog = require('./AuditLog');

// Define associations
User.hasMany(Issue, { foreignKey: 'userId' });
Issue.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(Subcategory, { foreignKey: 'categoryId' });
Subcategory.belongsTo(Category, { foreignKey: 'categoryId' });

Category.hasMany(Issue, { foreignKey: 'categoryId' });
Issue.belongsTo(Category, { foreignKey: 'categoryId' });

Subcategory.hasMany(Issue, { foreignKey: 'subcategoryId' });
Issue.belongsTo(Subcategory, { foreignKey: 'subcategoryId' });

Issue.hasMany(Comment, { foreignKey: 'issueId' });
Comment.belongsTo(Issue, { foreignKey: 'issueId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Official.hasMany(Comment, { foreignKey: 'officialId' });
Comment.belongsTo(Official, { foreignKey: 'officialId' });

Issue.hasMany(Upvote, { foreignKey: 'issueId' });
Upvote.belongsTo(Issue, { foreignKey: 'issueId' });

User.hasMany(Upvote, { foreignKey: 'userId' });
Upvote.belongsTo(User, { foreignKey: 'userId' });

// Authority associations
Authority.belongsToMany(Category, { through: 'AuthorityCategories', as: 'Categories', foreignKey: 'authorityId' });
Category.belongsToMany(Authority, { through: 'AuthorityCategories', as: 'Authorities', foreignKey: 'categoryId' });

// New: Authority <-> Subcategory mapping
Authority.belongsToMany(Subcategory, { through: 'AuthoritySubcategories', as: 'Subcategories', foreignKey: 'authorityId' });
Subcategory.belongsToMany(Authority, { through: 'AuthoritySubcategories', as: 'Authorities', foreignKey: 'subcategoryId' });

// Map Official to Authority (many officials per authority)
Authority.hasMany(Official, { foreignKey: 'authorityId' });
Official.belongsTo(Authority, { foreignKey: 'authorityId' });

Authority.hasMany(Issue, { foreignKey: 'assignedAuthorityId' });
Issue.belongsTo(Authority, { foreignKey: 'assignedAuthorityId' });

// Audit log associations to User (admins are users with role=admin)
User.hasMany(AuditLog, { foreignKey: 'adminId' });
AuditLog.belongsTo(User, { foreignKey: 'adminId' });

// Approval association to User
Issue.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Enable PostGIS extension
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Category,
  Subcategory,
  Official,
  Authority,
  Issue,
  Comment,
  Upvote,
  AuditLog,
  syncDatabase
};
