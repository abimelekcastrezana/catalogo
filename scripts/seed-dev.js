/**
 * Datos de prueba para DESARROLLO LOCAL. Es idempotente: se puede correr varias veces.
 * Uso: npm run seed:dev
 *
 * Crea:
 *  - admin@tiendatap.test / Admin12345   (rol admin, con una tienda interna oculta)
 *  - demo@tiendatap.test  / Demo12345    (rol vendor, dueño de la tienda /demo)
 *  - una tienda "demo" con 2 categorías y 6 productos
 */
if (process.env.NODE_ENV === 'production') {
  console.error('seed:dev no se puede ejecutar en producción.');
  process.exit(1);
}

const bcrypt = require('bcrypt');
const { sequelize, Vendor, User, Category, Product } = require('../db');

async function main() {
  sequelize.options.logging = false; // sin ruido de SQL en la consola
  await sequelize.authenticate();

  const [vendor] = await Vendor.findOrCreate({
    where: { slug: 'demo' },
    defaults: {
      name: 'Tienda Demo',
      whatsappPhone: '+520000000000',
      slogan: 'Datos de prueba para desarrollo',
      state: 'Guanajuato',
      city: 'Irapuato',
    },
  });

  // users.vendorId es obligatorio, así que el admin también necesita una tienda (oculta).
  const [adminVendor] = await Vendor.findOrCreate({
    where: { slug: 'admin-interno' },
    defaults: { name: 'Admin (interno)', whatsappPhone: '+520000000000', isActive: false },
  });

  const users = [
    { email: 'admin@tiendatap.test', password: 'Admin12345', role: 'admin', vendorId: adminVendor.id },
    { email: 'demo@tiendatap.test', password: 'Demo12345', role: 'vendor', vendorId: vendor.id },
  ];
  for (const u of users) {
    const exists = await User.findOne({ where: { email: u.email } });
    if (!exists) {
      await User.create({
        email: u.email,
        password: await bcrypt.hash(u.password, 10),
        role: u.role,
        vendorId: u.vendorId,
      });
    }
  }

  const catalogo = {
    Ropa: [
      ['Playera básica', 150],
      ['Sudadera con capucha', 420],
      ['Gorra', 120],
    ],
    Accesorios: [
      ['Mochila', 380],
      ['Cartera', 210],
      ['Llavero', 45],
    ],
  };

  let catPos = 0;
  for (const [catName, productos] of Object.entries(catalogo)) {
    const [category] = await Category.findOrCreate({
      where: { vendorId: vendor.id, slug: catName.toLowerCase() },
      defaults: { name: catName, position: catPos++ },
    });
    let pos = 0;
    for (const [name, price] of productos) {
      await Product.findOrCreate({
        where: { vendorId: vendor.id, name },
        defaults: {
          categoryId: category.id,
          price,
          description: `${name} de prueba`,
          position: pos++,
        },
      });
    }
  }

  console.log('Listo. Tienda: http://localhost:3000/demo');
  console.log('Vendedor: demo@tiendatap.test / Demo12345');
  console.log('Admin:    admin@tiendatap.test / Admin12345');
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
