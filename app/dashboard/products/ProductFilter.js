"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductFilter({ categories }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get('categoryId') || '';
  const [categoryId, setCategoryId] = useState(currentCategory);

  useEffect(() => { setCategoryId(currentCategory); }, [currentCategory]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (categoryId) { params.set('categoryId', categoryId); } else { params.delete('categoryId'); }
    params.delete('page');
    const queryString = params.toString();
    router.push(`/dashboard/products${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 flex-wrap">
      <div className="grid gap-1">
        <span className="text-xs font-medium text-[var(--muted)]">Categoría</span>
        <select
          name="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="select text-sm py-2 min-w-[160px]"
        >
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="secondary-button text-sm py-2 px-4">Filtrar</button>
    </form>
  );
}
