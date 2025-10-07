'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Issues', 'mlaInfo', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Store MLA name, party, constituency, etc.'
    });

    await queryInterface.addColumn('Issues', 'mpInfo', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Store MP name, party, constituency, etc.'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Issues', 'mlaInfo');
    await queryInterface.removeColumn('Issues', 'mpInfo');
  }
};
