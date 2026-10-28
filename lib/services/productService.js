import fs from 'fs';
import path from 'path';
import { UniqueConstraintError } from 'sequelize';
import db from '@/db/index.js';
import productQueries from '@/db/queries/products.js';
import { uploadConfig } from '@/app/common/config.js';
import { getVendorPlan, productLimitError, descriptionLimitError, productFieldsForPlan } from '@/lib/plan-limits';
import { parseDiscountPercent } from '@/app/lib/pricing';
import { KIND_CARD, normalizeKind, normalizeCardValues, cardStartingPrice } from '@/app/lib/products';
import { ServiceError } from '@/lib/services/serviceError';

const SKU_TAKEN = 'SKU already exists for this vendor';

function removeUpload(relativePath) {
  if (!relativePath) return;
  const file = path.join(uploadConfig.basePath, relativePath.replace(/^\/uploads/, ''));
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

function requireNamePrice({ name, price }) {
  if (!name || price === undefined || price === null) throw new ServiceError(400, 'Missing fields');
  const normalized = Number(price);
  if (Number.isNaN(normalized) || normalized < 0) throw new ServiceError(400, 'Price must be a positive number');
}

function requireValidDiscount(body) {
  const { error } = parseDiscountPercent(body.discountPercent);
  if (error) throw new ServiceError(400, error);
}

// Variantes de un producto normal (solo planes con funciones completas).
function normalizeProductVariants(variants) {
  return variants.map((v) => ({ id: v.id || null, name: v.name, price: v.price ? Number(v.price) : null }));
}

// Devuelve el precio base y los valores ya validados de una suscripción.
function resolveCard(variants) {
  const { values, error } = normalizeCardValues(variants);
  if (error) throw new ServiceError(400, error);
  return { price: cardStartingPrice(values), values };
}

export async function createProduct(vendorId, body) {
  const kind = normalizeKind(body.kind);
  const isCard = kind === KIND_CARD;
  let price = body.price;
  let variants = [];

  if (isCard) {
    if (!body.name) throw new ServiceError(400, 'Missing fields');
    const card = resolveCard(body.variants);
    price = card.price;
    variants = card.values;
  } else {
    requireNamePrice(body);
  }

  const plan = await getVendorPlan(vendorId);
  if (!plan) throw new ServiceError(404, 'Vendor not found');
  const limitError = await productLimitError(vendorId, plan);
  if (limitError) throw new ServiceError(403, limitError);
  const descriptionError = descriptionLimitError(plan, body.description);
  if (descriptionError) throw new ServiceError(400, descriptionError);

  if (!isCard && plan.fullProductFeatures) {
    requireValidDiscount(body);
    if (Array.isArray(body.variants)) variants = normalizeProductVariants(body.variants);
    const sku = body.sku ? body.sku.trim() : null;
    if (sku && (await productQueries.findSkuConflict(vendorId, sku))) throw new ServiceError(409, SKU_TAKEN);
  }

  try {
    return await db.sequelize.transaction(async (transaction) => {
      const product = await productQueries.create({
        vendorId,
        position: await productQueries.nextPosition(vendorId, { transaction }),
        ...productFieldsForPlan(plan, { ...body, price }, kind),
      }, { transaction });
      const created = await productQueries.createVariants(product.id, variants, { transaction });
      return { product: product.get({ plain: true }), variants: created.map((v) => v.get({ plain: true })) };
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) throw new ServiceError(409, SKU_TAKEN);
    throw error;
  }
}

export async function updateProduct(vendorId, productId, body) {
  const product = await productQueries.findByVendor(vendorId, productId);
  if (!product) throw new ServiceError(404, 'Product not found');
  const kind = product.kind; // el tipo no cambia después de crear
  const isCard = kind === KIND_CARD;

  const plan = await getVendorPlan(vendorId);
  // Solo se valida si cambió, para no bloquear productos creados en un plan anterior.
  const descriptionError = body.description !== product.description && descriptionLimitError(plan, body.description);
  if (descriptionError) throw new ServiceError(400, descriptionError);

  let price = body.price;
  let variants = null; // null = no tocar las variantes
  if (isCard && body.variants !== undefined) {
    if (!body.name) throw new ServiceError(400, 'Missing fields');
    const card = resolveCard(body.variants);
    price = card.price;
    variants = card.values;
  } else {
    requireNamePrice(body);
  }
  if (!isCard && plan.fullProductFeatures) {
    requireValidDiscount(body);
    if (Array.isArray(body.variants)) variants = normalizeProductVariants(body.variants);
    const sku = body.sku ? body.sku.trim() : null;
    if (sku && sku !== product.sku && (await productQueries.findSkuConflict(vendorId, sku))) {
      throw new ServiceError(409, SKU_TAKEN);
    }
  }

  const { saved, removed } = await db.sequelize.transaction(async (transaction) => {
    await product.update({
      ...productFieldsForPlan(plan, { ...body, price }, kind),
      isActive: typeof body.isActive === 'boolean' ? body.isActive : product.isActive,
    }, { transaction });
    return variants
      ? productQueries.syncVariants(productId, variants, { transaction })
      : { saved: [], removed: [] };
  });
  removed.forEach((v) => removeUpload(v.imagePath));

  return { product: product.get({ plain: true }), variants: saved.map((v) => v.get({ plain: true })) };
}
