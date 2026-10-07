/**
 * Catálogo de PRUEBA grande para Tapi (el asistente de compras).
 * Crea la tienda "moda-demo" con ~60 productos, categorías y variantes (tallas/colores).
 * Idempotente. Solo desarrollo. Uso: npm run seed:tapi
 */
if (process.env.NODE_ENV === 'production') {
  console.error('seed:tapi no se puede ejecutar en producción.');
  process.exit(1);
}

const bcrypt = require('bcrypt');
const { sequelize, Vendor, User, Category, Product, ProductVariant } = require('../db');

const TALLAS = ['S', 'M', 'L'];
const TALLAS_XL = ['S', 'M', 'L', 'XL'];
const COLORES = ['Negro', 'Blanco', 'Rojo', 'Azul'];

// [nombre, precio, variantes]  (variantes: lista de nombres; { n, p } trae precio propio)
const CATALOGO = {
  Playeras: [
    ['Playera básica', 150, TALLAS_XL],
    ['Playera oversize', 220, TALLAS],
    ['Playera estampada Tapi', 260, TALLAS],
    ['Playera deportiva', 240, TALLAS_XL],
    ['Playera polo', 280, TALLAS],
    ['Playera manga larga', 230, TALLAS],
    ['Playera de rayas', 210, TALLAS],
    ['Playera sin mangas', 170, TALLAS],
  ],
  Sudaderas: [
    ['Sudadera con capucha', 420, [{ n: 'S', p: 420 }, { n: 'M', p: 420 }, { n: 'L', p: 420 }, { n: 'XL', p: 450 }]],
    ['Sudadera sin capucha', 380, TALLAS_XL],
    ['Sudadera con cierre', 460, TALLAS],
    ['Chamarra ligera', 550, TALLAS],
    ['Chamarra de mezclilla', 690, TALLAS],
    ['Suéter tejido', 480, TALLAS],
  ],
  Pantalones: [
    ['Jeans slim', 520, ['28', '30', '32', '34']],
    ['Jeans rectos', 540, ['28', '30', '32', '34']],
    ['Pantalón de vestir', 590, ['28', '30', '32', '34']],
    ['Jogger', 360, TALLAS_XL],
    ['Short deportivo', 190, TALLAS],
    ['Short de mezclilla', 310, ['28', '30', '32']],
    ['Falda de mezclilla', 330, TALLAS],
    ['Leggings', 250, TALLAS],
  ],
  Accesorios: [
    ['Gorra negra', 120, null],
    ['Gorra roja', 120, null],
    ['Gorra de red', 130, null],
    ['Mochila', 380, COLORES.slice(0, 3)],
    ['Mochila pequeña', 290, COLORES.slice(0, 3)],
    ['Cartera', 210, null],
    ['Cinturón de piel', 240, ['Negro', 'Café']],
    ['Llavero', 45, null],
    ['Bufanda', 180, COLORES],
    ['Calcetas (par)', 60, ['Negras', 'Blancas']],
    ['Calcetas (paquete de 3)', 150, ['Negras', 'Blancas']],
    ['Lentes de sol', 280, null],
    ['Collar plateado', 200, null],
    ['Pulsera tejida', 80, null],
    ['Paraguas', 160, null],
  ],
  Calzado: [
    ['Tenis blancos', 780, ['25', '26', '27', '28']],
    ['Tenis negros', 790, ['25', '26', '27', '28']],
    ['Tenis deportivos', 850, ['25', '26', '27', '28']],
    ['Botas de piel', 1250, ['25', '26', '27', '28']],
    ['Sandalias', 320, ['25', '26', '27']],
    ['Zapatillas', 540, ['23', '24', '25']],
    ['Chanclas', 140, TALLAS],
  ],
  Hogar: [
    ['Taza Tapi', 110, null],
    ['Termo 500 ml', 260, ['Negro', 'Azul']],
    ['Cuaderno', 70, null],
    ['Libreta con pasta dura', 95, null],
    ['Vela aromática', 130, ['Lavanda', 'Vainilla']],
    ['Bolsa de tela', 85, null],
    ['Portavasos (set de 4)', 120, null],
    ['Almohada decorativa', 190, null],
  ],
};

async function main() {
  sequelize.options.logging = false;
  await sequelize.authenticate();

  const [vendor] = await Vendor.findOrCreate({
    where: { slug: 'moda-demo' },
    defaults: {
      name: 'Moda Demo',
      whatsappPhone: '+520000000000',
      slogan: 'Ropa y accesorios (catálogo de prueba para Tapi)',
      state: 'Guanajuato',
      city: 'Irapuato',
    },
  });

  const exists = await User.findOne({ where: { email: 'moda@tiendatap.test' } });
  if (!exists) {
    await User.create({
      email: 'moda@tiendatap.test',
      password: await bcrypt.hash('Moda12345', 10),
      role: 'vendor',
      vendorId: vendor.id,
    });
  }

  let catPos = 0;
  let total = 0;
  for (const [catName, productos] of Object.entries(CATALOGO)) {
    const [category] = await Category.findOrCreate({
      where: { vendorId: vendor.id, slug: catName.toLowerCase() },
      defaults: { name: catName, position: catPos++ },
    });
    let pos = 0;
    for (const [name, price, variantes] of productos) {
      const [product] = await Product.findOrCreate({
        where: { vendorId: vendor.id, name },
        defaults: { categoryId: category.id, price, description: `${name} (producto de prueba)`, position: pos++ },
      });
      total++;
      if (variantes) {
        let vpos = 0;
        for (const v of variantes) {
          const vname = typeof v === 'string' ? v : v.n;
          const vprice = typeof v === 'string' ? null : v.p;
          await ProductVariant.findOrCreate({
            where: { productId: product.id, name: vname },
            defaults: { price: vprice, position: vpos++ },
          });
        }
      }
    }
  }

  console.log(`Listo: tienda http://localhost:3000/moda-demo con ${total} productos.`);
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
