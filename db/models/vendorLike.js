const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VendorLike = sequelize.define('VendorLike', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    fingerprint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'vendor_likes',
    updatedAt: false,
  });

  return VendorLike;
};
