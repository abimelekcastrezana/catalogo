'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vendor_likes', {
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
      fingerprint: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ip: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addConstraint('vendor_likes', {
      fields: ['vendorId', 'fingerprint'],
      type: 'unique',
      name: 'vendor_likes_vendorId_fingerprint_unique',
    });

    await queryInterface.addIndex('vendor_likes', ['vendorId'], {
      name: 'vendor_likes_vendorId_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vendor_likes');
  },
};
