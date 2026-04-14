'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // vendorId debe ser obligatorio para todos los usuarios (incluidos admins)
    await queryInterface.changeColumn('users', 'vendorId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'vendors', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface) {
    // Revertir si es necesario
    await queryInterface.changeColumn('users', 'vendorId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'vendors', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
};
