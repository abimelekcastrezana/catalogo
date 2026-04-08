'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'vendor',
    });

    await queryInterface.changeColumn('users', 'vendorId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'vendors', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('vendors', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('vendors', 'isActive');
    await queryInterface.changeColumn('users', 'vendorId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'vendors', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
    await queryInterface.removeColumn('users', 'role');
  },
};
