// Reglas puras de producto/suscripción. Se usa en servidor (servicio) y en cliente (formularios).
// Una "suscripción" es una tarjeta prepago: nombre + imagen + 1 a 3 valores (variantes con precio).
export const KIND_PRODUCT = 'product';
export const KIND_CARD = 'card';
export const CARD_MAX_VALUES = 3;

export const DEFAULT_WHOLESALE_UNIT = 'Caja';
export const WHOLESALE_UNIT_MAX_LENGTH = 30;
export const WHOLESALE_UNIT_SUGGESTIONS = ['Caja', 'Paquete', 'Docena', 'Bolsa', 'Bulto', 'Costal'];

// Unidad mayorista del producto ("Caja" si el vendedor no puso otra).
export function wholesaleUnitLabel(product) {
  return (product?.wholesaleUnit || '').trim() || DEFAULT_WHOLESALE_UNIT;
}

export function normalizeWholesaleUnit(value) {
  const unit = (value || '').trim().slice(0, WHOLESALE_UNIT_MAX_LENGTH);
  return unit || null;
}

export function normalizeKind(kind) {
  return kind === KIND_CARD ? KIND_CARD : KIND_PRODUCT;
}

export function isCard(product) {
  return product?.kind === KIND_CARD;
}

// Valida y normaliza los valores de una suscripción. Devuelve { values } o { error }.
export function normalizeCardValues(variants) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return { error: 'La suscripción necesita al menos un valor.' };
  }
  if (variants.length > CARD_MAX_VALUES) {
    return { error: `Una suscripción admite hasta ${CARD_MAX_VALUES} valores.` };
  }
  const values = [];
  const seen = new Set();
  for (const v of variants) {
    const price = Number(v?.price);
    if (!Number.isFinite(price) || price <= 0) {
      return { error: 'Cada valor debe tener un monto mayor a 0.' };
    }
    if (seen.has(price)) return { error: 'Los valores de una suscripción no pueden repetirse.' };
    seen.add(price);
    values.push({ id: v.id || null, price, name: (v.name || '').trim() || `$${price}` });
  }
  return { values };
}

// Precio base de una suscripción: su valor más bajo (sirve para ordenar y buscar).
export function cardStartingPrice(values) {
  return Math.min(...values.map((v) => v.price));
}

// Sequelize ignora `order` dentro de `include`: variantes e imágenes se ordenan al leerlas.
export function withSortedRelations(product) {
  const byPosition = (a, b) => (a.position || 0) - (b.position || 0);
  return {
    ...product,
    ProductVariants: [...(product.ProductVariants || [])].sort(byPosition),
    ProductImages: [...(product.ProductImages || [])].sort(byPosition),
  };
}
