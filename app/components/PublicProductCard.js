"use client";

import { useState } from 'react';
import { useCartContext } from '@/app/context/CartContext';
import ProductDetailSheet from '@/app/components/ProductDetailSheet';

const BADGE_LABELS = {
  nuevo: 'NUEVO',
  oferta: 'OFERTA',
  premium: 'PREMIUM',
  mas_vendido: 'MÁS VENDIDO',
};

const BADGE_STYLES = {
  nuevo: 'bg-black/80 text-white',
  oferta: 'bg-red-600 text-white',
  premium: 'bg-white text-black border border-black/20',
  mas_vendido: 'bg-black/80 text-white',
};

export default function PublicProductCard({ product }) {
  const { addToCart, isInCart } = useCartContext();
  const inCart = isInCart(product.id);
  const images = (product.ProductImages || []).slice(0, 2);
  const [current, setCurrent] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);

  const imageUrl = images.length
    ? `/api/uploads${(images[current].path || '').replace(/^\/?uploads?\/?/, '/')}`
    : null;

  const badgeKey = product.badge && BADGE_LABELS[product.badge] ? product.badge : null;
  const hasWholesaleDiscount = product.wholesalePrice && Number(product.wholesalePrice) < Number(product.price);

  return (
    <>
      <article className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        {/* Imagen */}
        <div
          className="relative w-full aspect-square bg-[var(--surface-strong)] overflow-hidden cursor-pointer"
          onClick={() => setDetailOpen(true)}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
              <span className="text-4xl">📦</span>
            </div>
          )}

          {/* Badge de producto (nuevo/oferta/premium/más vendido) */}
          {badgeKey && (
            <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${BADGE_STYLES[badgeKey]}`}>
              {BADGE_LABELS[badgeKey]}
            </span>
          )}

          {/* Carousel */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrent((current - 1 + images.length) % images.length); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="Imagen anterior"
              >‹</button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrent((current + 1) % images.length); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="Siguiente imagen"
              >›</button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/50'}`}
                    aria-label={`Imagen ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badge "en carrito" */}
          {inCart && (
            <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 p-3 gap-1">
          <div className="flex-1 space-y-1">
            {product.Category?.name && (
              <span className="text-[10px] uppercase tracking-wide text-[var(--muted)] font-medium">
                {product.Category.name}
              </span>
            )}
            <h3
              className="font-semibold text-sm leading-snug text-[var(--text)] line-clamp-2 cursor-pointer hover:text-[var(--accent-text)] transition-colors"
              onClick={() => setDetailOpen(true)}
            >
              {product.name}
            </h3>
            {product.description && (
              <p className="text-[var(--muted)] text-xs line-clamp-2 leading-relaxed">{product.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-base font-bold text-[var(--text)] shrink-0">
                ${Number(product.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
              {hasWholesaleDiscount && (
                <span className="text-xs font-medium text-red-600 truncate">
                  Desde ${Number(product.wholesalePrice).toLocaleString('es-MX', { minimumFractionDigits: 2 })} por mayoreo
                </span>
              )}
            </div>
            <button
              onClick={() => addToCart(product)}
              className={`shrink-0 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                inCart
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] hover:shadow-sm'
              }`}
            >
              {inCart ? '✓ Agregado' : '+ Agregar'}
            </button>
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
