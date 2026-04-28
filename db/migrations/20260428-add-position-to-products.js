'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'position', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.sequelize.query(`
      UPDATE products p
      SET position = sub.row_num - 1
      FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY "vendorId" ORDER BY "createdAt" ASC) AS row_num
        FROM products
      ) sub
      WHERE p.id = sub.id
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'position');
  },
};
