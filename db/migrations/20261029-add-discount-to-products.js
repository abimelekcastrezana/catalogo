'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Descuento en porcentaje (1–99). Null = sin descuento.
    await queryInterface.addColumn('products', 'discountPercent', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    });
    // Si el descuento también aplica al precio de mayoreo (lo elige el vendedor).
    await queryInterface.addColumn('products', 'discountOnWholesale', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'discountOnWholesale');
    await queryInterface.removeColumn('products', 'discountPercent');
  },
};
