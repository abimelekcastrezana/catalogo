'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vendors', 'about', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('vendors', 'address', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('vendors', 'hours', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('vendors', 'instagram', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('vendors', 'facebook', { type: Sequelize.STRING, allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('vendors', 'facebook');
    await queryInterface.removeColumn('vendors', 'instagram');
    await queryInterface.removeColumn('vendors', 'hours');
    await queryInterface.removeColumn('vendors', 'address');
    await queryInterface.removeColumn('vendors', 'about');
  },
};