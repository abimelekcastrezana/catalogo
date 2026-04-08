"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditCategoryForm({ category, vendors }) {
  const router = useRouter();
  const [vendorId, setVendorId] = useState(category.vendorId || vendors[0]?.id || '');
  const [name, setName] = useState(category.name || '');
  const [slug, setSlug] = useState(category.slug || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const response = await fetch(`/api/admin/categories/${category.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, name, slug }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || 'Error actualizando categoría');
      setIsSubmitting(false);
      return;
    }

    setMessage('Categoría actualizada correctamente');
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', maxWidth: '520px' }}>
      <label style={{ display: 'grid', gap: '0.25rem' }}>
        Vendedor
        <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} required>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
          ))}
        </select>
      </label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la categoría" required />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug de categoría" required />
      <button type="submit" disabled={isSubmitting}>Guardar categoría</button>
      {message && <p>{message}</p>}
    </form>
  );
}
