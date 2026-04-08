'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vendors', 'cardColor', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('vendors', 'backgroundColor', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('vendors', 'backgroundColor');
    await queryInterface.removeColumn('vendors', 'cardColor');
  },
};
