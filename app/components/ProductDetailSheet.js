'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sheet, SheetContent, SheetTitle } from '@/app/components/ui/sheet';
import { Button } from '@/app/components/ui/button';
import { useCartContext } from '@/app/context/CartContext';
import { IconSwap } from '@/app/components/ui/icon-swap';
import { X, ChevronLeft, ChevronRight, Plus, Check, Package } from 'lucide-react';

function imageUrl(path) {
  return `/api/uploads${(path || '').replace(/^\/?uploads?\/?/, '/')}`;
}

function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    // Push a history state so browser back closes the lightbox instead of navigating away
    window.history.pushState({ lightbox: true }, '');

    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    };

    const onPopState = () => {
      // Browser back pressed — close the lightbox (state already popped)
      onClose();
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('popstate', onPopState);
      // If closed via ✕/Escape (not browser back), pop the state we pushed
      if (window.history.state?.lightbox) {
        window.history.back();
      }
    };
  }, [prev, next, onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Header */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3 z-10">
        <button
          type="button"
          onClick={onClose}
          className="hit text-white w-11 h-11 rounded-xl flex items-center justify-center transition-[background-color,transform] duration-150 hover:bg-white/10 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Cerrar"
        ><X className="h-6 w-6" strokeWidth={2} aria-hidden="true" /></button>
        {images.length > 1 && (
          <span className="text-white/80 text-sm font-bold tabular-nums">{current + 1}/{images.length}</span>
        )}
      </div>

      {/* Imagen */}
      <img
        src={imageUrl(images[current].path)}
        alt={`Foto ${current + 1}`}
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Flechas */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="hit absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center transition-[background-color,transform] duration-150 hover:bg-white/20 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Anterior"
          ><ChevronLeft className="h-6 w-6" strokeWidth={2} aria-hidden="true" /></button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="hit absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center transition-[background-color,transform] duration-150 hover:bg-white/20 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Siguiente"
          ><ChevronRight className="h-6 w-6" strokeWidth={2} aria-hidden="true" /></button>
        </>
      )}
    </div>,
    document.body
  );
}

const DESCRIPTION_CLAMP = 120;

export default function ProductDetailSheet({ product, open, onClose }) {
  const { addToCart, isInCart } = useCartContext();

  const variants = product.ProductVariants || [];
  const hasVariants = variants.length > 0;
  const hasWholesale = !!product.wholesalePrice;

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [wholesaleActive, setWholesaleActive] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const desc = product.description || '';
  const isLong = desc.length > DESCRIPTION_CLAMP;

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setCurrentImg(0);
      setDescExpanded(false);
      setSelectedVariant(null);
      setWholesaleActive(false);
    }
  }, [open, product.id]);

  // Reset imagen al cambiar variante
  useEffect(() => {
    setCurrentImg(0);
  }, [selectedVariant]);

  // Imágenes efectivas: si la variante tiene foto, va primero
  const baseImages = product.ProductImages || [];
  const effectiveImages = selectedVariant?.imagePath
    ? [{ path: selectedVariant.imagePath }, ...baseImages]
    : baseImages;

  const currentImageUrl = effectiveImages.length
    ? imageUrl(effectiveImages[currentImg].path)
    : null;

  // Precio efectivo
  const basePrice = selectedVariant?.price != null
    ? Number(selectedVariant.price)
    : Number(product.price);
  const wholesaleUnit = Number(product.wholesalePrice);
  const wholesaleMin = product.wholesaleMinQty || 1;
  // Precio por lote mayorista (lo que se muestra y se cobra por "unidad" de carrito)
  const lotPrice = wholesaleUnit * wholesaleMin;
  const displayPrice = wholesaleActive ? lotPrice : basePrice;

  // Cart item a agregar
  const cartId = selectedVariant
    ? `${product.id}_variant_${selectedVariant.id}`
    : product.id;
  const baseCartName = selectedVariant
    ? `${product.name} — ${selectedVariant.name}`
    : product.name;
  const cartName = wholesaleActive ? `${baseCartName} (Mayoreo)` : baseCartName;
  const cartItem = { ...product, id: cartId, name: cartName, price: displayPrice, quantity: 1 };

  const inCart = isInCart(cartId);
  const addDisabled = false;

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="bottom"
          className="sheet-modal-md p-0 bg-[var(--bg)] text-[var(--text)] rounded-t-2xl max-h-[92dvh] flex flex-col md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-2xl md:w-full md:max-h-[90vh] md:flex-row"
        >
          <SheetTitle className="sr-only">{product.name}</SheetTitle>

          {/* Imagen principal */}
          <div className="relative w-full aspect-[4/3] bg-[var(--surface-strong)] flex-shrink-0 overflow-hidden rounded-t-2xl md:w-[45%] md:aspect-auto md:rounded-l-2xl md:rounded-tr-none md:self-stretch">
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={product.name}
                className="w-full h-full object-contain cursor-zoom-in"
                width={600}
                height={450}
                decoding="async"
                onClick={() => setLightboxOpen(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--muted)]"><Package className="h-12 w-12" strokeWidth={1.5} aria-hidden="true" /></div>
            )}

            {/* Navegación entre fotos */}
            {effectiveImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentImg((currentImg - 1 + effectiveImages.length) % effectiveImages.length)}
                  className="hit absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center transition-[background-color,transform] duration-150 hover:bg-black/70 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Anterior"
                ><ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" /></button>
                <button
                  type="button"
                  onClick={() => setCurrentImg((currentImg + 1) % effectiveImages.length)}
                  className="hit absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center transition-[background-color,transform] duration-150 hover:bg-black/70 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Siguiente"
                ><ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" /></button>
                <div className="absolute bottom-2 right-3 bg-black/55 text-white text-xs font-bold tabular-nums px-2 py-0.5 rounded-full">
                  {currentImg + 1}/{effectiveImages.length}
                </div>
              </>
            )}
          </div>

          {/* Columna de contenido */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Nombre + precio */}
              <div className="flex items-start justify-between gap-3 md:pr-10">
                <h2 className="text-xl font-extrabold text-[var(--text)] leading-snug flex-1">
                  {product.name}
                </h2>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-[var(--text)] tabular-nums">
                      ${displayPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    {hasWholesale && (
                      <button
                        type="button"
                        onClick={() => setWholesaleActive((v) => !v)}
                        aria-pressed={wholesaleActive}
                        className={`hit px-2.5 py-1 rounded-lg text-xs font-extrabold border-2 transition-[background-color,border-color,color,transform] duration-100 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          wholesaleActive
                            ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent)]'
                            : 'border-[var(--border-strong)] text-[var(--muted)] hover:border-[var(--accent)]'
                        }`}
                      >
                        Mayoreo
                      </button>
                    )}
                  </div>
                  {wholesaleActive && (
                    <div className="text-right space-y-0.5">
                      <p className="text-xs text-[var(--muted)]">
                        {wholesaleMin} piezas × ${wholesaleUnit.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/u
                      </p>
                      {product.wholesaleDescription && (
                        <p className="text-xs text-[var(--muted)]">{product.wholesaleDescription}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Categoría */}
              {product.Category?.name && (
                <span className="inline-block px-2.5 py-1 rounded-lg bg-[var(--surface-strong)] text-[var(--muted)] text-xs font-bold">
                  {product.Category.name}
                </span>
              )}

              {/* Descripción */}
              {desc && (
                <div className="space-y-1">
                  <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-line">
                    {isLong && !descExpanded ? `${desc.slice(0, DESCRIPTION_CLAMP)}…` : desc}
                  </p>
                  {isLong && (
                    <button
                      type="button"
                      onClick={() => setDescExpanded((v) => !v)}
                      aria-expanded={descExpanded}
                      className="hit text-sm text-[var(--accent-text)] font-bold hover:underline focus-visible:outline-none focus-visible:underline"
                    >
                      {descExpanded ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>
              )}

              {/* Variantes */}
              {hasVariants && (
                <div className="space-y-2">
                  <p className="text-sm font-extrabold text-[var(--text)]">Variante</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                        aria-pressed={selectedVariant?.id === v.id}
                        className={`min-h-10 px-3.5 py-1.5 rounded-lg border-2 text-sm font-bold transition-[background-color,border-color,box-shadow,transform] duration-100 active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          selectedVariant?.id === v.id
                            ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent)] shadow-[0_2px_0_0_var(--accent)]'
                            : 'border-[var(--border-strong)] text-[var(--text)] shadow-[0_2px_0_0_var(--border-strong)] hover:bg-[var(--accent-soft)]'
                        }`}
                      >
                        {v.name}{v.price != null ? ` — $${Number(v.price).toFixed(2)}` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botón fijo abajo */}
            <div className="px-5 py-4 border-t-2 border-[var(--border)] flex-shrink-0">
              <Button
                onClick={() => { if (!addDisabled) { addToCart(cartItem); onClose(); } }}
                disabled={addDisabled}
                variant={inCart ? 'whatsapp' : 'default'}
                size="lg"
                className="w-full"
              >
                {!addDisabled && <IconSwap active={inCart} from={Plus} to={Check} />}
                {addDisabled
                  ? 'Selecciona una variante'
                  : inCart
                  ? 'Ya está en el carrito'
                  : 'Agregar al carrito'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {lightboxOpen && effectiveImages.length > 0 && (
        <Lightbox
          images={effectiveImages}
          startIndex={currentImg}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
