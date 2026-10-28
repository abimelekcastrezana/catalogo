import db from '@/db/index.js';
import { normalizeWholesaleUnit } from '@/app/lib/products';
import { parseDiscountPercent } from '@/app/lib/pricing';
import { getPlan, isAtLimit, productLimitMessage, categoryLimitMessage, descriptionTooLong } from '@/app/lib/plans';

export async function getVendorPlan(vendorId) {
  const vendor = await db.Vendor.findByPk(vendorId, { attributes: ['id', 'plan'] });
  return vendor ? getPlan(vendor.plan) : null;
}

// Devuelve el mensaje de error si el vendor ya llegó a su límite de productos, o null.
export async function productLimitError(vendorId, plan) {
  if (plan.maxProducts === null) return null;
  const count = await db.Product.count({ where: { vendorId } });
  return isAtLimit(plan.maxProducts, count) ? productLimitMessage(plan) : null;
}

export async function categoryLimitError(vendorId, plan) {
  if (plan.maxCategories === null) return null;
  const count = await db.Category.count({ where: { vendorId } });
  return isAtLimit(plan.maxCategories, count) ? categoryLimitMessage(plan) : null;
}

// IDs de los productos que la tienda pública puede mostrar: los primeros N activos según el orden
// del vendor. Si bajó de plan y tiene más, el resto queda oculto. null = sin límite.
export async function visibleProductIds(vendorId, plan) {
  if (plan.maxProducts === null) return null;
  const rows = await db.Product.findAll({
    where: { vendorId, isActive: true },
    order: [['position', 'ASC'], ['createdAt', 'DESC']],
    attributes: ['id'],
    limit: plan.maxProducts,
  });
  return rows.map((r) => r.id);
}

export function descriptionLimitError(plan, description) {
  return descriptionTooLong(plan, description)
    ? `La descripción no puede pasar de ${plan.maxDescriptionLength} caracteres en el plan ${plan.label}.`
    : null;
}

// Campos de producto que el plan permite guardar. En Free se omiten los extras: al crear quedan
// en null y al editar no se tocan (si el vendor baja de plan, sus datos se conservan).
export function productFieldsForPlan(plan, body, kind = 'product') {
  const { name, description, price, sku, categoryId, badge, wholesalePrice, wholesaleMinQty, wholesaleDescription, wholesaleUnit, discountPercent, discountOnWholesale } = body;
  const fields = { name, description, price: Number(price) };
  // Suscripción: sin SKU ni mayoreo; categoría y etiqueta solo si el plan las incluye.
  if (kind === 'card') {
    const card = { ...fields, kind, discountPercent: null, discountOnWholesale: false };
    return plan.fullProductFeatures ? { ...card, categoryId: categoryId || null, badge: badge || null } : card;
  }
  if (!plan.fullProductFeatures) return fields;
  return {
    ...fields,
    sku: sku ? sku.trim() : null,
    categoryId: categoryId || null,
    badge: badge || null,
    wholesalePrice: wholesalePrice ? Number(wholesalePrice) : null,
    wholesaleMinQty: wholesaleMinQty ? parseInt(wholesaleMinQty, 10) : null,
    // Campos nuevos: solo se tocan si vienen en la petición (un cliente que no los envía no los borra).
    ...(wholesaleUnit !== undefined && { wholesaleUnit: normalizeWholesaleUnit(wholesaleUnit) }),
    ...(discountPercent !== undefined && { discountPercent: parseDiscountPercent(discountPercent).percent ?? null }),
    ...(discountOnWholesale !== undefined && { discountOnWholesale: Boolean(discountOnWholesale) }),
    wholesaleDescription: wholesaleDescription || null,
  };
}
