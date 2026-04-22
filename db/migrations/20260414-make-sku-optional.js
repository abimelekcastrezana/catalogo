'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remover la constraint unique primero
    await queryInterface.removeConstraint('products', 'products_vendorId_sku_unique');

    // Cambiar columna sku para permitir null
    await queryInterface.changeColumn('products', 'sku', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Recrear el índice unique pero que permita nulls
    await queryInterface.addIndex('products', {
      unique: true,
      fields: ['vendorId', 'sku'],
      name: 'products_vendorId_sku_unique',
      where: { sku: { [Sequelize.Op.ne]: null } },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('products', 'products_vendorId_sku_unique');

    await queryInterface.changeColumn('products', 'sku', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addIndex('products', {
      unique: true,
      fields: ['vendorId', 'sku'],
      name: 'products_vendorId_sku_unique',
    });
  },
};
