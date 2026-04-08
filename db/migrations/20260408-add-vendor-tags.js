/**
 * Add optional tag fields to vendors so stores can be indexed and searched from the homepage.
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('vendors', 'tag1', {
    type: Sequelize.STRING,
    allowNull: true,
  });
  await queryInterface.addColumn('vendors', 'tag2', {
    type: Sequelize.STRING,
    allowNull: true,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('vendors', 'tag2');
  await queryInterface.removeColumn('vendors', 'tag1');
}
