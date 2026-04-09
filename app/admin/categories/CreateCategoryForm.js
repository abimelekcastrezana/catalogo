"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCategoryForm({ vendors }) {
  const router = useRouter();
  const [vendorId, setVendorId] = useState(vendors[0]?.id || '');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const response = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, name, slug }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'Error creando categoría');
      setIsSubmitting(false);
      return;
    }

    setMessage('Categoría creada correctamente');
    setName('');
    setSlug('');
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" style={{ maxWidth: '520px' }}>
      <div className="form-field">
        <label>Vendedor</label>
        <select className="select" value={vendorId} onChange={(e) => setVendorId(e.target.value)} required>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label>Nombre</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la categoría" required />
      </div>
      <div className="form-field">
        <label>Slug</label>
        <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug de categoría" required />
      </div>
      <button type="submit" className="primary-button" disabled={isSubmitting}>{isSubmitting ? 'Creando...' : 'Crear categoría'}</button>
      {message && <p className="text-small" style={{ margin: 0 }}>{message}</p>}
    </form>
  );
}
