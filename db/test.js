const { sequelize, Vendor, Category, Product, Cart } = require('./index');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection OK');

    // Comprueba que los modelos y relaciones están definidos en Sequelize
    console.log('models:', Object.keys(sequelize.models));

    const hasVendorCategory = Category.associations && Category.associations.Vendor;
    const hasVendorProduct = Product.associations && Product.associations.Vendor;
    const hasVendorCart = Cart.associations && Cart.associations.Vendor;

    console.log('rel: Category->Vendor', !!hasVendorCategory);
    console.log('rel: Product->Vendor', !!hasVendorProduct);
    console.log('rel: Cart->Vendor', !!hasVendorCart);

    if (!hasVendorCategory || !hasVendorProduct || !hasVendorCart) {
      throw new Error('Faltan asociaciones en los modelos');
    }

    console.log('✅ Relaciones básicas en modelos OK');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ DB test failed:', error);
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
}

testConnection();
