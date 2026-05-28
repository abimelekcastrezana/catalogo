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
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
  const inCart = isInCart(product.id);
  const images = product.ProductImages || [];
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
    }
  }, [open, product.id]);

  const currentImageUrl = images.length
    ? imageUrl(images[currentImg].path)
    : null;

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="bottom"
          className="p-0 bg-[var(--bg)] text-[var(--text)] rounded-t-2xl max-h-[92dvh] flex flex-col"
        >
          <SheetTitle className="sr-only">{product.name}</SheetTitle>

          {/* Imagen principal */}
          <div className="relative w-full aspect-[4/3] bg-black flex-shrink-0 overflow-hidden rounded-t-2xl">
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
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImg((currentImg - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center text-lg hover:bg-black/70 transition-colors"
                  aria-label="Anterior"
                >‹</button>
                <button
                  onClick={() => setCurrentImg((currentImg + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center text-lg hover:bg-black/70 transition-colors"
                  aria-label="Siguiente"
                >›</button>
                <div className="absolute bottom-2 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {currentImg + 1}/{images.length}
                </div>
              </>
            )}
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Nombre + precio */}
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-[var(--text)] leading-snug flex-1">
                {product.name}
              </h2>
              <span className="text-xl font-bold text-[var(--text)] flex-shrink-0">
                ${Number(product.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
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
                    className="text-xs text-[var(--accent)] font-medium hover:underline"
                  >
                    {descExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Botón fijo abajo */}
          <div className="px-5 py-4 border-t border-[var(--border)] flex-shrink-0">
            <Button
              onClick={() => { addToCart(product); onClose(); }}
              className={`w-full font-semibold ${
                inCart
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white'
              }`}
            >
              {inCart ? '✓ Ya está en el carrito' : '+ Agregar al carrito'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {lightboxOpen && images.length > 0 && (
        <Lightbox
          images={images}
          startIndex={currentImg}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
