const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Subcategory = require('./Subcategory');
const Official = require('./Official');
const Authority = require('./Authority');
const Issue = require('./Issue');
const Comment = require('./Comment');
const Upvote = require('./Upvote');

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
Authority.belongsToMany(Category, { through: 'AuthorityCategories' });
Category.belongsToMany(Authority, { through: 'AuthorityCategories' });

Authority.hasMany(Issue, { foreignKey: 'assignedAuthorityId' });
Issue.belongsTo(Authority, { foreignKey: 'assignedAuthorityId' });

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
  syncDatabase
};
