/**
 * Carga el catálogo de UNA tienda y lo prepara para el modelo:
 *  - códigos cortos (P1, P2...) en vez de UUID: el modelo no inventa ni se equivoca copiando ids largos
 *  - texto compacto para gastar pocos tokens
 */
const { Product, ProductVariant, Category, Vendor } = require('../../db');

async function loadCatalog(slug) {
  const vendor = await Vendor.findOne({ where: { slug, isActive: true } });
  if (!vendor) throw new Error(`Tienda "${slug}" no existe o no está activa`);

  const products = await Product.findAll({
    where: { vendorId: vendor.id, isActive: true },
    include: [{ model: ProductVariant }, { model: Category }],
    order: [[Category, 'position', 'ASC'], ['position', 'ASC'], ['name', 'ASC']],
  });

  const byCode = {};
  const lines = products.map((p, i) => {
    const code = `P${i + 1}`;
    const variants = (p.ProductVariants || []).sort((a, b) => a.position - b.position);
    byCode[code] = { product: p, variants };
    const vtxt = variants.length ? ` | opciones: ${variants.map((v) => v.name).join(', ')}` : '';
    return `${code} | ${p.name} | $${Number(p.price).toFixed(0)}${vtxt}`;
  });

  return { vendor, byCode, text: lines.join('\n') };
}

module.exports = { loadCatalog };
