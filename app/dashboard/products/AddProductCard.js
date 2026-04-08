"use client";

import { useState } from 'react';
import AddProductForm from './AddProductForm';

export default function AddProductCard({ vendorId, categories, apiBase = '/api/vendors' }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderRadius: '999px',
          border: '1px solid #0645ad',
          background: '#fff',
          color: '#0645ad',
          cursor: 'pointer',
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>+</span>
        {open ? 'Cerrar formulario' : 'Crear producto nuevo'}
      </button>

      {open && (
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <AddProductForm vendorId={vendorId} categories={categories} apiBase={apiBase} />
        </div>
      )}
    </div>
  );
}
