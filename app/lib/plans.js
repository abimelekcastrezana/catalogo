// Planes de suscripción de TiendaTap. Se usa en servidor (validación) y en cliente (formularios).
// null = sin límite.
export const PLANS = {
  free: {
    key: 'free',
    priceMxn: 0, // anual
    label: 'Free',
    maxProducts: 10,
    maxCategories: 0,
    // Free solo permite fotos, nombre, descripción corta y precio.
    fullProductFeatures: false,
    maxDescriptionLength: 100,
  },
  plus: {
    key: 'plus',
    priceMxn: 399, // anual
    label: 'Plus',
    maxProducts: 40,
    maxCategories: 5,
    fullProductFeatures: true,
    maxDescriptionLength: null,
  },
  max: {
    key: 'max',
    priceMxn: 799, // anual
    label: 'Max',
    maxProducts: null,
    maxCategories: null,
    fullProductFeatures: true,
    maxDescriptionLength: null,
  },
};

export const PLAN_KEYS = Object.keys(PLANS);
export const DEFAULT_PLAN = 'free';

export function getPlan(key) {
  return PLANS[key] || PLANS[DEFAULT_PLAN];
}

// Las suscripciones de pago son anuales; Free no vence.
export function planExpires(key) {
  return key !== 'free';
}

// Hoy + 1 año, como YYYY-MM-DD (fecha local).
export function defaultPlanExpiry(from = new Date()) {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + 1);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Vencimiento a guardar: Free → null; si se envió una fecha, esa; si no, la actual o hoy + 1 año.
export function resolvePlanExpiry(planKey, requested, current = null) {
  if (!planExpires(planKey)) return null;
  return requested || current || defaultPlanExpiry();
}

// YYYY-MM-DD que exista en el calendario (rechaza 2027-02-31, que Date convertiría en marzo).
export function isValidDateOnly(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

// "12 oct 2027"
export function formatPlanExpiry(value) {
  if (!value) return '';
  return new Date(`${value}T00:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function isAtLimit(limit, count) {
  return limit !== null && count >= limit;
}

export function productLimitMessage(plan) {
  return `Tu plan ${plan.label} permite hasta ${plan.maxProducts} productos.`;
}

export function categoryLimitMessage(plan) {
  return plan.maxCategories === 0
    ? `Tu plan ${plan.label} no incluye categorías.`
    : `Tu plan ${plan.label} permite hasta ${plan.maxCategories} categorías.`;
}

export function descriptionTooLong(plan, description) {
  return plan.maxDescriptionLength !== null && (description || '').length > plan.maxDescriptionLength;
}

// Categorías que la tienda pública muestra: las primeras N según su orden (vienen ordenadas).
export function visibleCategories(plan, categories) {
  return plan.maxCategories === null ? categories : categories.slice(0, plan.maxCategories);
}

// Quita del producto lo que el plan no muestra en la tienda pública. Los datos siguen en la BD
// (si el vendor sube de plan, reaparecen).
export function productForPublicPlan(plan, product) {
  if (plan.fullProductFeatures) return product;
  const description = product.description || '';
  return {
    ...product,
    description: description.length > plan.maxDescriptionLength
      ? `${description.slice(0, plan.maxDescriptionLength)}…`
      : description,
    categoryId: null,
    Category: null,
    badge: null,
    wholesalePrice: null,
    wholesaleMinQty: null,
    wholesaleDescription: null,
    ProductVariants: [],
  };
}
