// Cálculo de descuentos. Puro: lo usan el servicio (validación) y la tienda/carrito (cliente).
export const DISCOUNT_MIN = 1;
export const DISCOUNT_MAX = 99;

// Valida el porcentaje capturado. Vacío = sin descuento. Devuelve { percent } o { error }.
export function parseDiscountPercent(value) {
  if (value === undefined || value === null || value === '') return { percent: null };
  const percent = Number(value);
  if (!Number.isFinite(percent) || percent < DISCOUNT_MIN || percent > DISCOUNT_MAX) {
    return { error: `El descuento debe estar entre ${DISCOUNT_MIN} y ${DISCOUNT_MAX}%.` };
  }
  return { percent: Math.round(percent * 100) / 100 };
}

// Precio con el porcentaje aplicado, redondeado a centavos.
export function applyDiscount(price, percent) {
  const base = Number(price);
  const pct = Number(percent) || 0;
  if (!pct) return base;
  return Math.round(base * (100 - pct)) / 100;
}

// Porcentaje que aplica a una presentación del producto (0 = ninguno). El mayoreo solo lleva
// descuento si el vendedor lo eligió.
export function discountFor(product, { wholesale = false } = {}) {
  const percent = Number(product?.discountPercent) || 0;
  if (!percent) return 0;
  return wholesale && !product.discountOnWholesale ? 0 : percent;
}

// Precio unitario que se cobra de un renglón del carrito (price = precio de lista).
export function itemUnitPrice(item) {
  return applyDiscount(item.price, item.discountPercent);
}

export function cartTotals(cart) {
  return cart.reduce(
    (acc, item) => {
      acc.total += itemUnitPrice(item) * item.quantity;
      acc.savings += (Number(item.price) - itemUnitPrice(item)) * item.quantity;
      return acc;
    },
    { total: 0, savings: 0 }
  );
}
