'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search, Package, LayoutGrid, ChevronDown } from 'lucide-react';

// Chips con canto inferior (mismo lenguaje que los botones con volumen).
// El estado seleccionado se distingue por color de relleno + borde + texto, no solo por color.
const CHIP = 'inline-flex h-10 items-center rounded-lg border-2 px-4 text-sm font-bold whitespace-nowrap transition-[background-color,border-color,box-shadow,transform] duration-100 ease-out active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const CHIP_ON = 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-text)] shadow-[0_2px_0_0_var(--accent)]';
const CHIP_OFF = 'border-[var(--border-strong)] bg-[var(--card)] text-[var(--text)] shadow-[0_2px_0_0_var(--border-strong)] hover:bg-[var(--accent-soft)]';

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
          <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--muted)] pointer-events-none" strokeWidth={2} aria-hidden="true" />
          <input
            type="search"
            name="q"
            aria-label="Buscar producto"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Buscar producto…"
            className="input w-full"
            style={{ paddingLeft: '2.75rem' }}
            autoComplete="off"
            spellCheck={false}
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="anim-pop-in absolute z-30 top-full left-0 right-0 mt-2 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] shadow-card overflow-hidden">
              {suggestions.map((product) => {
                const imageUrl = product.image
                  ? `/api/uploads${product.image.replace(/^\/?uploads?\/?/, '/')}`
                  : null;
                return (
                  <a
                    key={product.id}
                    href={buildHref({ q: product.name })}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-[var(--accent-soft)] focus-visible:bg-[var(--accent-soft)] focus-visible:outline-none"
                  >
                    <div className="w-9 h-9 rounded-[10px] bg-[var(--surface-strong)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" width={36} height={36} loading="lazy" decoding="async" className="img-outline w-full h-full object-cover" />
                      ) : (
                        <Package className="h-4 w-4 text-[var(--muted)]" strokeWidth={1.5} aria-hidden="true" />
                      )}
                    </div>
                    <span className="flex-1 text-sm font-bold text-[var(--text)] truncate">{product.name}</span>
                    <span className="text-sm font-extrabold text-[var(--text)] flex-shrink-0 tabular-nums">
                      ${Number(product.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 pt-0.5">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          className={[
            CHIP,
            'flex-shrink-0 flex items-center gap-1.5',
            currentCategoryId ? CHIP_ON : CHIP_OFF,
          ].join(' ')}
        >
          <LayoutGrid className="h-4 w-4" strokeWidth={2} aria-hidden="true" /> {activeCategoryName || 'Categorías'}
        </button>

        <div className="relative flex-shrink-0">
          <select
            value={currentSort || ''}
            onChange={handleSortChange}
            aria-label="Ordenar productos"
            className={`${CHIP} ${CHIP_OFF} appearance-none pr-9 cursor-pointer`}
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" strokeWidth={2} aria-hidden="true" />
        </div>
      </div>

      {filtersOpen && (
        <div className="anim-pop-in flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1 pt-0.5">
          <a
            href={buildHref({ categoryId: '' })}
            aria-current={!currentCategoryId ? 'true' : undefined}
            className={[CHIP, 'flex-shrink-0', !currentCategoryId ? CHIP_ON : CHIP_OFF].join(' ')}
          >
            Todas
          </a>
          {categories.map((category) => (
            <a
              key={category.id}
              href={buildHref({ categoryId: category.id })}
              aria-current={currentCategoryId === category.id ? 'true' : undefined}
              className={[CHIP, 'flex-shrink-0', currentCategoryId === category.id ? CHIP_ON : CHIP_OFF].join(' ')}
            >
              {category.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
