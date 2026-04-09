"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductFilter({ categories }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get('categoryId') || '';
  const [categoryId, setCategoryId] = useState(currentCategory);

  useEffect(() => {
    setCategoryId(currentCategory);
  }, [currentCategory]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (categoryId) {
      params.set('categoryId', categoryId);
    } else {
      params.delete('categoryId');
    }
    params.delete('page');
    const queryString = params.toString();
    router.push(`/dashboard/products${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      <label style={{ display: 'grid', gap: '0.35rem' }}>
        <span>Filtrar por categoría</span>
        <select name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="select" style={{ minWidth: '200px' }}>
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="secondary-button">Filtrar</button>
    </form>
  );
}
