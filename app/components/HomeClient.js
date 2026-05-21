'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { MX_STATES } from '@/app/lib/mx-regions';

function logoSrc(logoUrl) {
  if (!logoUrl) return null;
  return logoUrl.startsWith('/') ? `/api/uploads${logoUrl.replace(/^\/uploads\/?/, '/')}` : logoUrl;
}

function regionLabel(vendor) {
  if (vendor.city && vendor.state) return `${vendor.city}, ${vendor.state}`;
  if (vendor.state) return vendor.state;
  return null;
}

/* ── Mobile: card que va directo al catálogo ── */
function VendorMobileCard({ vendor }) {
  const logo = logoSrc(vendor.logoUrl);
  const tags = [vendor.tag1, vendor.tag2].filter(Boolean);
  const location = regionLabel(vendor);

  return (
    <Link
      href={`/${vendor.slug}`}
      className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-[var(--accent)] hover:shadow-md transition-all active:scale-[0.98]"
    >
      {/* Hero imagen */}
      <div className="w-full h-36 bg-[var(--surface-strong)] flex items-center justify-center overflow-hidden">
        {logo ? (
          <img src={logo} alt={vendor.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">🏪</span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div>
          <p className="font-semibold text-base text-[var(--text)] leading-tight">{vendor.name}</p>
          {vendor.slogan && (
            <p className="text-sm text-[var(--muted)] mt-0.5 line-clamp-1">{vendor.slogan}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
          ))}
          {location && (
            <span className="text-[10px] text-[var(--muted)] flex items-center gap-0.5">
              📍 {location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Desktop: fila seleccionable para el split ── */
function VendorDesktopRow({ vendor, selected, onSelect }) {
  const logo = logoSrc(vendor.logoUrl);
  const tags = [vendor.tag1, vendor.tag2].filter(Boolean);
  const isSelected = selected?.id === vendor.id;
  const location = regionLabel(vendor);

  return (
    <button
      type="button"
      onClick={() => onSelect(vendor)}
      className={`w-full text-left rounded-2xl border transition-all p-4 flex items-start gap-3 cursor-pointer ${
        isSelected
          ? 'border-[var(--accent)] bg-[var(--accent-soft)] shadow-md'
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:shadow-sm'
      }`}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--surface-strong)] flex items-center justify-center flex-shrink-0">
        {logo ? (
          <img src={logo} alt={vendor.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">🏪</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--text)] truncate">{vendor.name}</p>
        {vendor.slogan && (
          <p className="text-xs text-[var(--muted)] truncate mt-0.5">{vendor.slogan}</p>
        )}
        <div className="flex gap-1.5 flex-wrap mt-1.5 items-center">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
          ))}
          {location && (
            <span className="text-[10px] text-[var(--muted)]">📍 {location}</span>
          )}
        </div>
      </div>
      {isSelected && <span className="text-[var(--accent)] text-lg flex-shrink-0 self-center">›</span>}
    </button>
  );
}

/* ── Desktop: preview derecho ── */
function VendorPreview({ vendor, baseUrl }) {
  const logo = logoSrc(vendor.logoUrl);
  const tags = [vendor.tag1, vendor.tag2].filter(Boolean);
  const location = regionLabel(vendor);

  return (
    <div className="flex flex-col h-full">
      <div className="w-full h-48 rounded-2xl overflow-hidden bg-[var(--surface-strong)] flex items-center justify-center mb-5">
        {logo ? (
          <img src={logo} alt={vendor.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">🏪</span>
        )}
      </div>
      <div className="flex-1 space-y-3">
        <div>
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">Tienda</p>
          <h2 className="text-2xl font-bold text-[var(--text)] leading-tight">{vendor.name}</h2>
          {vendor.slogan && <p className="text-[var(--muted)] mt-1 text-sm">{vendor.slogan}</p>}
        </div>
        <p className="text-sm text-[var(--muted)]">/{vendor.slug}</p>
        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
          <span>📍</span>
          <span>{location || 'Ubicación no especificada'}</span>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <Link href={`/${vendor.slug}`}>
          <Button className="w-full">Ver catálogo completo</Button>
        </Link>
        <p className="text-center text-xs text-[var(--muted)]">{baseUrl}/{vendor.slug}</p>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function HomeClient({ vendors, search, region, baseUrl }) {
  const [selected, setSelected] = useState(vendors[0] || null);

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Buscador */}
      <form method="get" className="flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-[180px] space-y-1">
          <label className="text-sm font-medium text-[var(--muted)]">Buscar tienda, tag o categoría</label>
          <Input
            name="search"
            defaultValue={search}
            placeholder="Ej. belleza, uñas, spa"
            className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)]"
          />
        </div>
        <div className="min-w-[160px] space-y-1">
          <label className="text-sm font-medium text-[var(--muted)]">Estado</label>
          <select
            name="region"
            defaultValue={region}
            className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm"
          >
            <option value="">Todos los estados</option>
            {MX_STATES.map((s) => (
              <option key={s} value={s.toLowerCase()}>{s}</option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="outline" className="self-end">Buscar</Button>
      </form>

      <p className="text-sm text-[var(--muted)]">
        {vendors.length} tienda{vendors.length !== 1 ? 's' : ''} encontrada{vendors.length !== 1 ? 's' : ''}
      </p>

      {vendors.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted)]">
          <p className="text-4xl mb-3">🔍</p>
          <p>No se encontraron tiendas{search ? ` para "${search}"` : ''}{region ? ` en ${region}` : ''}.</p>
        </div>
      ) : (
        <>
          {/* Mobile: grid de cards (< lg) */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            {vendors.map((vendor) => (
              <VendorMobileCard key={vendor.id} vendor={vendor} />
            ))}
          </div>

          {/* Desktop: split lista + preview (≥ lg) */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_340px] gap-4">
            <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {vendors.map((vendor) => (
                <VendorDesktopRow
                  key={vendor.id}
                  vendor={vendor}
                  selected={selected}
                  onSelect={setSelected}
                />
              ))}
            </div>
            {selected && (
              <div className="sticky top-6 border border-[var(--border)] rounded-3xl bg-[var(--surface)] shadow-card p-6 self-start">
                <VendorPreview vendor={selected} baseUrl={baseUrl} />
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
