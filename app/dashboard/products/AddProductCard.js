"use client";

import { useState } from 'react';
import AddProductForm from './AddProductForm';

export default function AddProductCard({ vendorId, categories }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '16px', padding: '1rem', background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          width: '100%',
          border: 'none',
          background: 'transparent',
          padding: 0,
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '1.5rem' }}>+</div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Agregar producto</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#555' }}>Haz clic para abrir el formulario de nuevo producto.</p>
        </div>
      </button>

      {open && (
        <div style={{ marginTop: '1rem' }}>
          <AddProductForm vendorId={vendorId} categories={categories} />
        </div>
      )}
    </div>
  );
}
