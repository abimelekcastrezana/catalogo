'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'position', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.sequelize.query(`
      UPDATE categories c
      SET position = sub.row_num - 1
      FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY "vendorId" ORDER BY "createdAt" ASC) AS row_num
        FROM categories
      ) sub
      WHERE c.id = sub.id
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('categories', 'position');
  },
};
