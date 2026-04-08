"use client";

import { useState } from 'react';

export default function PublicProductCard({ product, cardColor }) {
  const images = (product.ProductImages || []).slice(0, 2);
  const [current, setCurrent] = useState(0);
  const rawImagePath = images.length ? images[current].path || '' : '';
  const cleanedPath = rawImagePath.replace(/^\/?uploads?\/?/, '/');
  const imageUrl = images.length ? `/api/uploads${cleanedPath}` : null;

  return (
    <article style={{ border: '1px solid #ddd', padding: '0.9rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: cardColor || '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', position: 'relative', boxSizing: 'border-box', minHeight: '0', alignSelf: 'stretch' }}>
      <div style={{ fontSize: '0.82rem', color: '#555', fontWeight: 600 }}>
        Categoría: {product.Category?.name || 'Sin categoría'}
      </div>

      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', minHeight: '150px', background: '#f6f6f6', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            Sin imagen
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrent((current - 1 + images.length) % images.length)}
              style={{
                position: 'absolute',
                left: '0.6rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.85)',
                background: 'rgba(0,0,0,0.35)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setCurrent((current + 1) % images.length)}
              style={{
                position: 'absolute',
                right: '0.6rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.85)',
                background: 'rgba(0,0,0,0.35)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      <div style={{ flex: '1 1 auto' }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
        <p style={{ margin: '0 0 0.75rem 0', color: '#555' }}>{product.description || 'Sin descripción'}</p>
        <div style={{ color: '#555', fontSize: '0.95rem', marginBottom: '0.75rem' }}>SKU: {product.sku}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>${Number(product.price).toFixed(2)}</div>
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrent(index)}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: '1px solid #555',
                  background: current === index ? '#555' : '#fff',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
