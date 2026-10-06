'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sheet, SheetContent, SheetTitle } from '@/app/components/ui/sheet';
import { Button } from '@/app/components/ui/button';
import { useCartContext } from '@/app/context/CartContext';

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
          onClick={onClose}
          className="text-white text-2xl font-light w-10 h-10 flex items-center justify-center"
          aria-label="Cerrar"
        >✕</button>
        {images.length > 1 && (
          <span className="text-white/70 text-sm">{current + 1}/{images.length}</span>
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
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white text-xl flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Anterior"
          >‹</button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white text-xl flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Siguiente"
          >›</button>
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
          className="p-0 bg-[var(--bg)] text-[var(--text)] rounded-t-2xl max-h-[92dvh] flex flex-col md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-2xl md:w-full md:max-h-[90vh] md:flex-row"
        >
          <SheetTitle className="sr-only">{product.name}</SheetTitle>

          {/* Imagen principal */}
          <div className="relative w-full aspect-[4/3] bg-black flex-shrink-0 overflow-hidden rounded-t-2xl md:w-[45%] md:aspect-auto md:rounded-l-2xl md:rounded-tr-none md:self-stretch">
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={product.name}
                className="w-full h-full object-contain cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
            )}

            {/* Navegación entre fotos */}
            {effectiveImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImg((currentImg - 1 + effectiveImages.length) % effectiveImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center text-lg hover:bg-black/70 transition-colors"
                  aria-label="Anterior"
                >‹</button>
                <button
                  onClick={() => setCurrentImg((currentImg + 1) % effectiveImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center text-lg hover:bg-black/70 transition-colors"
                  aria-label="Siguiente"
                >›</button>
                <div className="absolute bottom-2 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
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
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-[var(--text)] leading-snug flex-1">
                  {product.name}
                </h2>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[var(--text)]">
                      ${displayPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    {hasWholesale && (
                      <button
                        onClick={() => setWholesaleActive((v) => !v)}
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                          wholesaleActive
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                            : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]'
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
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[var(--surface-strong)] text-[var(--muted)] text-xs font-medium">
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
                      onClick={() => setDescExpanded((v) => !v)}
                      className="text-xs text-[var(--accent-text)] font-medium hover:underline"
                    >
                      {descExpanded ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>
              )}

              {/* Variantes */}
              {hasVariants && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Variante</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                        className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                          selectedVariant?.id === v.id
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                            : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]'
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
            <div className="px-5 py-4 border-t border-[var(--border)] flex-shrink-0">
              <Button
                onClick={() => { if (!addDisabled) { addToCart(cartItem); onClose(); } }}
                disabled={addDisabled}
                className={`w-full font-semibold ${
                  addDisabled
                    ? 'bg-[var(--surface-strong)] text-[var(--muted)] cursor-not-allowed'
                    : inCart
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white'
                }`}
              >
                {addDisabled
                  ? 'Selecciona una variante'
                  : inCart
                  ? '✓ Ya está en el carrito'
                  : '+ Agregar al carrito'}
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
