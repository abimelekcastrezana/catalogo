const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    wholesalePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    wholesaleMinQty: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Descuento en % (1–99); null = sin descuento
    discountPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    // Si el descuento también aplica al precio de mayoreo
    discountOnWholesale: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // Nombre de la unidad mayorista (Caja, Paquete, Docena…); null = 'Caja'
    wholesaleUnit: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    wholesaleDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // 'product' | 'card' (suscripción: sus valores viven en ProductVariant)
    kind: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'product',
    },
    badge: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'products',
    timestamps: true,
  });

  return Product;
};