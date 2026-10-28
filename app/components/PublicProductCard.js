"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Plus, Package } from 'lucide-react';
import { useCartContext } from '@/app/context/CartContext';
import ProductDetailSheet from '@/app/components/ProductDetailSheet';
import { Button } from '@/app/components/ui/button';
import { IconSwap } from '@/app/components/ui/icon-swap';
import { isCard, wholesaleUnitLabel } from '@/app/lib/products';
import { applyDiscount, discountFor } from '@/app/lib/pricing';

const BADGE_LABELS = {
  nuevo: 'NUEVO',
  oferta: 'OFERTA',
  premium: 'PREMIUM',
  mas_vendido: 'MÁS VENDIDO',
};

const BADGE_STYLES = {
  nuevo: 'bg-[var(--info-fill)] text-white',
  oferta: 'bg-[var(--accent)] text-[var(--accent-fg)]',
  premium: 'bg-[var(--text)] text-[var(--bg)]',
  mas_vendido: 'bg-[var(--highlight)] text-[var(--highlight-fg)]',
};

const money = (n) => Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 });

export default function PublicProductCard({ product }) {
  const { addToCart, isInCart } = useCartContext();
  const images = (product.ProductImages || []).slice(0, 2);
  const [current, setCurrent] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);

  const imageUrl = images.length
    ? `/api/uploads${(images[current].path || '').replace(/^\/?uploads?\/?/, '/')}`
    : null;

  const variants = product.ProductVariants || [];
  const card = isCard(product);
  // Con variantes (o en una suscripción) hay que elegir una opción antes de agregar.
  const needsChoice = variants.length > 0;
  const startingPrice = card && variants.length ? Math.min(...variants.map((v) => Number(v.price))) : Number(product.price);

  const badgeKey = product.badge && BADGE_LABELS[product.badge] ? product.badge : null;
  const hasWholesaleDiscount = product.wholesalePrice && Number(product.wholesalePrice) < Number(product.price);

  // Mayoreo desde la tarjeta: selector Pieza | Caja (con variantes se elige en el detalle).
  const [mode, setMode] = useState('unit');
  const lotSize = product.wholesaleMinQty || 1;
  const lotUnit = wholesaleUnitLabel(product);
  const showLotSelector = hasWholesaleDiscount && !needsChoice;
  const lotActive = showLotSelector && mode === 'lot';
  const lotPrice = Number(product.wholesalePrice) * lotSize;
  // El descuento viaja con el renglón del carrito, que es quien calcula el total.
  const unitPercent = discountFor(product);
  const lotPercent = discountFor(product, { wholesale: true });
  const cartItem = lotActive
    ? { ...product, id: `${product.id}_lot`, name: `${product.name} (${lotUnit} ×${lotSize})`, price: lotPrice, lotSize, lotUnit, discountPercent: lotPercent }
    : { ...product, price: Number(product.price), discountPercent: unitPercent };
  const inCartNow = isInCart(cartItem.id);

  const activePercent = lotActive ? lotPercent : unitPercent;
  const listPrice = lotActive ? lotPrice : startingPrice;

  return (
    <>
      <article className="group flex flex-col rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] overflow-hidden transition-[border-color,box-shadow,transform] duration-150 hover:border-[var(--brand-soft)] hover:shadow-card hover:-translate-y-0.5">
        {/* Imagen */}
        <div
          className="relative w-full aspect-square bg-[var(--surface-strong)] overflow-hidden cursor-pointer"
          onClick={() => setDetailOpen(true)}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              width={400}
              height={400}
              loading="lazy"
              decoding="async"
              className="img-outline w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
              <Package className="h-10 w-10" strokeWidth={1.5} aria-hidden="true" />
            </div>
          )}

          {/* Badge de producto (nuevo/oferta/premium/más vendido) */}
          {(badgeKey || activePercent > 0) && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              {badgeKey && (
                <span className={`px-2 py-1 rounded-lg text-[11px] leading-none font-extrabold tracking-wide ${BADGE_STYLES[badgeKey]}`}>
                  {BADGE_LABELS[badgeKey]}
                </span>
              )}
              {activePercent > 0 && (
                <span className="px-2 py-1 rounded-lg border-2 border-[var(--accent)] bg-[var(--card)] text-[11px] leading-none font-extrabold tabular-nums text-[var(--accent-text)]">
                  -{activePercent}%
                </span>
              )}
            </div>
          )}

          {/* Carousel */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrent((current - 1 + images.length) % images.length); }}
                className="hit absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-[background-color,transform] duration-150 hover:bg-black/70 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Imagen anterior"
              ><ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" /></button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrent((current + 1) % images.length); }}
                className="hit absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-[background-color,transform] duration-150 hover:bg-black/70 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Siguiente imagen"
              ><ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" /></button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                    className={`hit w-2 h-2 rounded-full transition-colors duration-150 ${i === current ? 'bg-white' : 'bg-white/50'}`}
                    aria-label={`Imagen ${i + 1}`}
                    aria-current={i === current}
                  />
                ))}
              </div>
            </>
          )}

          {/* Indicador "en carrito" */}
          {(inCartNow || isInCart(product.id) || isInCart(`${product.id}_lot`)) && (
            <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[var(--whatsapp-fill)] text-white flex items-center justify-center border-2 border-[var(--card)]">
              <Check className="h-4 w-4" strokeWidth={3} aria-label="En el carrito" />
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 p-3 gap-1">
          <div className="flex-1 space-y-1">
            {product.Category?.name && (
              <span className="text-[11px] tracking-wide text-[var(--muted)] font-bold">
                {product.Category.name}
              </span>
            )}
            <h3
              className="font-extrabold text-[15px] leading-snug text-[var(--text)] line-clamp-2 cursor-pointer transition-colors duration-150 hover:text-[var(--accent-text)]"
              onClick={() => setDetailOpen(true)}
            >
              {product.name}
            </h3>
            {product.description && (
              <p className="text-[var(--muted)] text-xs line-clamp-2 leading-relaxed">{product.description}</p>
            )}
            {card && variants.length > 0 && (
              <p className="m-0 text-xs font-bold text-[var(--accent-text)] tabular-nums">
                {variants.map((v) => `$${money(v.price).replace(/\.00$/, '')}`).join(' · ')}
              </p>
            )}
            {showLotSelector && (
              <div role="group" aria-label="Presentación" className="flex gap-1.5 pt-1">
                {[['unit', 'Pieza'], ['lot', lotSize > 1 ? `${lotUnit} ×${lotSize}` : 'Mayoreo']].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={mode === key}
                    onClick={() => setMode(key)}
                    className={`hit h-8 flex-1 rounded-lg border-2 px-2 text-xs font-extrabold transition-[background-color,border-color,color,transform] duration-100 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      mode === key
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                        : 'border-[var(--border-strong)] text-[var(--muted)] hover:border-[var(--accent)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {!showLotSelector && hasWholesaleDiscount && (
              <p className="m-0 text-xs font-bold text-[var(--accent-text)] tabular-nums">
                {lotSize > 1 ? `${lotUnit} de ${lotSize} pzas: ` : 'Mayoreo: '}${money(product.wholesalePrice)} c/u
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="min-w-0 text-lg font-extrabold leading-tight text-[var(--text)] tabular-nums">
              {card && variants.length > 1 && <span className="mr-1 text-xs font-bold text-[var(--muted)]">Desde</span>}
              {activePercent > 0 && (
                <s className="block text-xs font-bold leading-tight text-[var(--muted)]">${money(listPrice)}</s>
              )}
              ${money(applyDiscount(listPrice, activePercent))}
              {lotActive && <span className="block text-xs font-bold leading-tight text-[var(--muted)]">${money(applyDiscount(product.wholesalePrice, lotPercent))} c/u</span>}
            </span>
            <Button
              size="sm"
              variant={inCartNow ? 'whatsapp' : 'default'}
              onClick={() => (needsChoice ? setDetailOpen(true) : addToCart(cartItem))}
              className="w-full shrink-0 rounded-[12px] sm:w-auto"
            >
              <IconSwap active={inCartNow} from={Plus} to={Check} />
              {inCartNow ? 'Agregado' : needsChoice ? 'Elegir' : 'Agregar'}
            </Button>
          </div>
        </div>
      </article>

      <ProductDetailSheet
        product={product}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
