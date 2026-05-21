"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as F from '@/app/lib/form-styles';

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
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, name, slug }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Error creando categoría'); setIsSubmitting(false); return; }
    setMessage('Categoría creada correctamente');
    setName(''); setSlug('');
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 max-w-lg">
      <div className={F.field}>
        <label className={F.label}>Vendedor</label>
        <select className={F.select} value={vendorId} onChange={(e) => setVendorId(e.target.value)} required>
          {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>
      <div className={F.field}>
        <label className={F.label}>Nombre</label>
        <input className={F.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la categoría" required />
      </div>
      <div className={F.field}>
        <label className={F.label}>Slug</label>
        <input className={F.input} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-categoria" required />
      </div>
      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? 'Creando...' : 'Crear categoría'}
      </button>
      {message && <p className={F.msg(message)}>{message}</p>}
    </form>
  );
}
