'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Nombre de la unidad mayorista (Caja, Paquete, Docena…). Null = "Caja".
    await queryInterface.addColumn('products', 'wholesaleUnit', {
      type: Sequelize.STRING(30),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'wholesaleUnit');
  },
};
