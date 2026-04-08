"use client";

import { useState } from 'react';
import CreateVendorForm from './CreateVendorForm';

export default function CreateVendorWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          border: '1px solid #ccc',
          borderRadius: '999px',
          background: '#fff',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>+</span>
        {open ? 'Cancelar' : 'Crear tienda nueva'}
      </button>

      {open && (
        <div style={{ marginTop: '1rem', maxWidth: '520px' }}>
          <CreateVendorForm />
        </div>
      )}
    </div>
  );
}
