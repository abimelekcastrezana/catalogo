'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // En una transacción: si algo falla, ninguna tienda existente queda en Free.
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('vendors', 'plan', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'free',
      }, { transaction });
      // Vencimiento de la suscripción anual; Free no vence (null).
      await queryInterface.addColumn('vendors', 'planExpiresAt', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      }, { transaction });
      // Las tiendas que ya existen pasan a Max para no perder nada de lo que usan hoy; su primer
      // año vence el 2027-10-12.
      await queryInterface.sequelize.query(
        `UPDATE vendors SET plan = 'max', "planExpiresAt" = '2027-10-12'`,
        { transaction }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('vendors', 'planExpiresAt');
    await queryInterface.removeColumn('vendors', 'plan');
  },
};
