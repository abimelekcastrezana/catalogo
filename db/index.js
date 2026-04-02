require('server-only');

const sequelize = require('./connection');

const Vendor = require('./models/vendor')(sequelize);
const Category = require('./models/category')(sequelize);
const Product = require('./models/product')(sequelize);
const ProductImage = require('./models/productImage')(sequelize);
const Cart = require('./models/cart')(sequelize);
const CartItem = require('./models/cartItem')(sequelize);

// Relacionamientos
Vendor.hasMany(Category, { foreignKey: 'vendorId' });
Category.belongsTo(Vendor, { foreignKey: 'vendorId' });

Vendor.hasMany(Product, { foreignKey: 'vendorId' });
Product.belongsTo(Vendor, { foreignKey: 'vendorId' });

Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Product.hasMany(ProductImage, { foreignKey: 'productId' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

Vendor.hasMany(Cart, { foreignKey: 'vendorId' });
Cart.belongsTo(Vendor, { foreignKey: 'vendorId' });

Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
  sequelize,
  Vendor,
  Category,
  Product,
  ProductImage,
  Cart,
  CartItem,
};