'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const SORT_LABELS = {
  '': 'Relevancia',
  recent: 'Más reciente',
  price_asc: 'Precio: menor a mayor',
  price_desc: 'Precio: mayor a menor',
};

export default function CategoryFilterBar({ vendorSlug, categories, currentCategoryId, currentQuery, currentSort }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(currentQuery || '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const boxRef = useRef(null);

  const buildHref = ({ categoryId = currentCategoryId, q = currentQuery, sort = currentSort } = {}) => {
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId);
    if (q) params.set('q', q);
    if (sort) params.set('sort', sort);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/vendors/${vendorSlug}/products/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.products || []);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, vendorSlug]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    router.push(buildHref({ q: query }));
  };

  const handleSortChange = (e) => {
    router.push(buildHref({ sort: e.target.value }));
  };

  const activeCategoryName = categories.find((c) => c.id === currentCategoryId)?.name;

  return (
    <div className="space-y-3 w-full">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1" ref={boxRef}>
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Buscar producto..."
            className="input w-full rounded-full"
            style={{ paddingLeft: '2.75rem' }}
            autoComplete="off"
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-30 top-full left-0 right-0 mt-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-card overflow-hidden">
              {suggestions.map((product) => {
                const imageUrl = product.image
                  ? `/api/uploads${product.image.replace(/^\/?uploads?\/?/, '/')}`
                  : null;
                return (
                  <a
                    key={product.id}
                    href={buildHref({ q: product.name })}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--accent-soft)] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[var(--surface-strong)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm">📦</span>
                      )}
                    </div>
                    <span className="flex-1 text-sm text-[var(--text)] truncate">{product.name}</span>
                    <span className="text-sm font-semibold text-[var(--text)] flex-shrink-0">
                      ${Number(product.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={[
            'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap',
            currentCategoryId
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
              : 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent-soft)]',
          ].join(' ')}
        >
          <span>☰</span> {activeCategoryName || 'Categorías'}
        </button>

        <div className="relative flex-shrink-0">
          <select
            value={currentSort || ''}
            onChange={handleSortChange}
            className="appearance-none px-4 pr-8 py-2 rounded-full text-sm font-medium border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">▾</span>
        </div>
      </div>

      {filtersOpen && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <a
            href={buildHref({ categoryId: '' })}
            className={[
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap',
              !currentCategoryId
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                : 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent-soft)]',
            ].join(' ')}
          >
            Todas
          </a>
          {categories.map((category) => (
            <a
              key={category.id}
              href={buildHref({ categoryId: category.id })}
              className={[
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap',
                currentCategoryId === category.id
                  ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                  : 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent-soft)]',
              ].join(' ')}
            >
              {category.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
