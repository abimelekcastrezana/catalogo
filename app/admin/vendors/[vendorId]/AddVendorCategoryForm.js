"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddVendorCategoryForm({ vendorId }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slugRegex = /^[A-Za-z0-9-]+$/;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!slugRegex.test(slug)) {
      setMessage('Slug inválido. Solo letras, números y guiones.');
      return;
    }
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
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', border: '1px solid #ddd', borderRadius: '12px', padding: '1rem', background: '#fff' }}>
      <h2 style={{ marginTop: 0 }}>Agregar categoría</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la categoría" required />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" required pattern="[A-Za-z0-9-]+" title="Solo letras, números y guiones" />
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creando...' : 'Crear categoría'}</button>
      {message && <p>{message}</p>}
    </form>
  );
}
