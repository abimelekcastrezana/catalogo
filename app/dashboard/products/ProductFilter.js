"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductFilter({ categories }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get('categoryId') || '';
  const [categoryId, setCategoryId] = useState(currentCategory);

  const handleSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (categoryId) {
      params.set('categoryId', categoryId);
    } else {
      params.delete('categoryId');
    }
    router.push(`/dashboard/products?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        Filtrar por categoría
        <select name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ padding: '0.5rem', minWidth: '200px' }}>
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>
      <button type="submit" style={{ padding: '0.6rem 1rem' }}>Filtrar</button>
    </form>
  );
}
