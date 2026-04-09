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
        className="secondary-button"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
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
