const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vendor = sequelize.define('Vendor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    whatsappPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slogan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tag1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tag2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'vendors',
    timestamps: true,
  });

  return Vendor;
};