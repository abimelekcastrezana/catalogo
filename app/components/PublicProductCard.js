"use client";

import { useState } from 'react';

export default function PublicProductCard({ product }) {
  const images = (product.ProductImages || []).slice(0, 2);
  const [current, setCurrent] = useState(0);
  const imageUrl = images.length ? `/api/uploads${images[current].path.replace(/^\/uploads/, '')}` : null;

  return (
    <article style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 180px', gap: '1rem', alignItems: 'center' }}>
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
        <p style={{ margin: '0 0 0.5rem 0' }}>{product.description || 'Sin descripción'}</p>
        <div style={{ color: '#555', fontSize: '0.95rem' }}>SKU: {product.sku}</div>
        <div style={{ color: '#555', fontSize: '0.95rem' }}>Categoría: {product.Category?.name || 'Sin categoría'}</div>
        <div style={{ marginTop: '0.75rem', fontSize: '1.1rem', fontWeight: '700' }}>${Number(product.price).toFixed(2)}</div>
      </div>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {imageUrl ? (
          <div style={{ position: 'relative' }}>
            <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '0.5rem',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.85)',
                    border: '1px solid #ccc',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    cursor: 'pointer',
                  }}
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() => setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '0.5rem',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.85)',
                    border: '1px solid #ccc',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    cursor: 'pointer',
                  }}
                >
                  ▶
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f6f6', borderRadius: '8px', border: '1px solid #eee', color: '#888' }}>
            Sin imagen
          </div>
        )}
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
