const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StoreEvent = sequelize.define('StoreEvent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    tableName: 'store_events',
    updatedAt: false,
  });

  return StoreEvent;
};