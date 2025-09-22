const { Authority, sequelize } = require('../models');

const cleanupDuplicates = async () => {
  try {
    console.log('Starting duplicate cleanup...');
    
    // Get all authorities grouped by name and level
    const authorities = await Authority.findAll({
      order: [['name', 'ASC'], ['createdAt', 'DESC']]
    });
    
    const uniqueAuthorities = new Map();
    const duplicatesToDelete = [];
    
    authorities.forEach(auth => {
      const key = `${auth.name}-${auth.level}`;
      if (uniqueAuthorities.has(key)) {
        duplicatesToDelete.push(auth.id);
      } else {
        uniqueAuthorities.set(key, auth.id);
      }
    });
    
    console.log(`Found ${duplicatesToDelete.length} duplicates to delete`);
    
    if (duplicatesToDelete.length > 0) {
      await Authority.destroy({
        where: { id: duplicatesToDelete }
      });
      console.log('Duplicates cleaned up successfully');
    }
    
    const remainingCount = await Authority.count();
    console.log(`Remaining authorities: ${remainingCount}`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await sequelize.close();
  }
};

cleanupDuplicates();
