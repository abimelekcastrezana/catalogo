'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 'product' (producto normal) | 'card' (suscripción: tarjeta con 1 a 3 valores en product_variants)
    await queryInterface.addColumn('products', 'kind', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'product',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'kind');
  },
};
