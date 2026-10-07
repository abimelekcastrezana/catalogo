"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Plus, Package } from 'lucide-react';
import { useCartContext } from '@/app/context/CartContext';
import ProductDetailSheet from '@/app/components/ProductDetailSheet';
import { Button } from '@/app/components/ui/button';
import { IconSwap } from '@/app/components/ui/icon-swap';

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
          {badgeKey && (
            <span className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[11px] leading-none font-extrabold tracking-wide ${BADGE_STYLES[badgeKey]}`}>
              {BADGE_LABELS[badgeKey]}
            </span>
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
          {inCart && (
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
            {hasWholesaleDiscount && (
              <p className="m-0 text-xs font-bold text-[var(--accent-text)] tabular-nums">
                Mayoreo desde ${money(product.wholesalePrice)}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="min-w-0 text-lg font-extrabold leading-tight text-[var(--text)] tabular-nums">
              ${money(product.price)}
            </span>
            <Button
              size="sm"
              variant={inCart ? 'whatsapp' : 'default'}
              onClick={() => addToCart(product)}
              className="w-full shrink-0 rounded-[12px] sm:w-auto"
            >
              <IconSwap active={inCart} from={Plus} to={Check} />
              {inCart ? 'Agregado' : 'Agregar'}
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
