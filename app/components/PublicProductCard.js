"use client";

import { useState } from 'react';

export default function PublicProductCard({ product }) {
  const images = (product.ProductImages || []).slice(0, 2);
  const [current, setCurrent] = useState(0);
  const rawImagePath = images.length ? images[current].path || '' : '';
  const cleanedPath = rawImagePath.replace(/^\/?uploads?\/?/, '/');
  const imageUrl = images.length ? `/api/uploads${cleanedPath}` : null;

  return (
    <article className="card">
      <div className="card-hero">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            Sin imagen
          </div>
        )}

        <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(255,255,255,0.92)', padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', color: 'var(--muted)', boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}>
          {product.Category?.name ? `Categoría: ${product.Category.name}` : 'Sin categoría'}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrent((current - 1 + images.length) % images.length)}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.85)',
                background: 'rgba(15,23,42,0.6)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                boxShadow: '0 10px 24px rgba(15,23,42,0.18)',
              }}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setCurrent((current + 1) % images.length)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36px',
                height: '36px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.85)',
                background: 'rgba(15,23,42,0.6)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                boxShadow: '0 10px 24px rgba(15,23,42,0.18)',
              }}
              aria-label="Siguiente imagen"
            >
              ›
            </button>
            <div style={{ position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.45rem', padding: '0 0.5rem' }}>
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrent(index)}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.9)',
                    background: current === index ? '#fff' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                  }}
                  aria-label={`Imagen ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card-body">
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.2' }}>{product.name}</h3>
          <p style={{ margin: 0, color: '#555', minHeight: '2.4rem', overflowWrap: 'anywhere' }}>{product.description || 'Sin descripción'}</p>
          <div style={{ color: '#555', fontSize: '0.95rem' }}>SKU: {product.sku}</div>
        </div>

        <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>${Number(product.price).toFixed(2)}</div>
        </div>
      </div>
    </article>
  );
}
