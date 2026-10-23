'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('store_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
        primaryKey: true,
      },
      vendorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'vendors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false, // 'visit' | 'product_view' | 'whatsapp_click'
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Las consultas del panel siempre filtran por tienda y por fecha.
    await queryInterface.addIndex('store_events', ['vendorId', 'createdAt'], {
      name: 'store_events_vendorId_createdAt_idx',
    });
    await queryInterface.addIndex('store_events', ['vendorId', 'type'], {
      name: 'store_events_vendorId_type_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('store_events');
  },
};