// Consultas ORM de productos y variantes. La lógica de negocio vive en lib/services/.
const db = require('../index');

function findByVendor(vendorId, productId, options = {}) {
  return db.Product.findOne({ where: { id: productId, vendorId }, ...options });
}

function findSkuConflict(vendorId, sku, options = {}) {
  return db.Product.findOne({ where: { vendorId, sku }, ...options });
}

async function nextPosition(vendorId, options = {}) {
  const last = await db.Product.findOne({
    where: { vendorId },
    order: [['position', 'DESC']],
    attributes: ['position'],
    ...options,
  });
  return (last?.position ?? -1) + 1;
}

function create(values, options = {}) {
  return db.Product.create(values, options);
}

function findVariants(productId, options = {}) {
  return db.ProductVariant.findAll({ where: { productId }, order: [['position', 'ASC']], ...options });
}

function createVariants(productId, variants, options = {}) {
  return Promise.all(
    variants.map((v, position) =>
      db.ProductVariant.create({ productId, name: v.name, price: v.price, position }, options)
    )
  );
}

// Sincroniza las variantes con la lista recibida: actualiza las que traen `id` (conservando su
// foto), crea las nuevas y borra las que ya no vienen. Devuelve { saved, removed } en el mismo
// orden de `variants`.
async function syncVariants(productId, variants, options = {}) {
  const existing = await findVariants(productId, options);
  const byId = new Map(existing.map((v) => [v.id, v]));
  const keepIds = new Set(variants.map((v) => v.id).filter((id) => byId.has(id)));

  const removed = existing.filter((v) => !keepIds.has(v.id));
  if (removed.length) {
    await db.ProductVariant.destroy({ where: { id: removed.map((v) => v.id) }, ...options });
  }

  const saved = [];
  for (let position = 0; position < variants.length; position += 1) {
    const { id, name, price } = variants[position];
    const current = id && byId.get(id);
    saved.push(
      current
        ? await current.update({ name, price, position }, options)
        : await db.ProductVariant.create({ productId, name, price, position }, options)
    );
  }
  return { saved, removed };
}

module.exports = {
  findByVendor,
  findSkuConflict,
  nextPosition,
  create,
  findVariants,
  createVariants,
  syncVariants,
};
