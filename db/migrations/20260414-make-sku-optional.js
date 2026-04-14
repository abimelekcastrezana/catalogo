'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remover constraint unique de (vendorId, sku) para permitir SKU nullable
    await queryInterface.removeIndex('products', 'products_vendorId_sku_unique');
    
    // Cambiar vendorId_sku a permitir null en sku
    await queryInterface.changeColumn('products', 'sku', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir
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
