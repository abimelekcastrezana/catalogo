'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { MX_STATES } from '@/app/lib/mx-regions';
import { MapPin, Store, ChevronRight, Search } from 'lucide-react';

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
      className="block rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] overflow-hidden transition-[border-color,transform,box-shadow] duration-150 hover:border-[var(--brand-soft)] hover:shadow-card active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Hero imagen */}
      <div className="w-full h-36 bg-[var(--surface-strong)] flex items-center justify-center overflow-hidden">
        {logo ? (
          <img src={logo} alt={vendor.name} width={400} height={144} loading="lazy" decoding="async" className="img-outline w-full h-full object-cover" />
        ) : (
          <Store className="h-12 w-12 text-[var(--muted)]" strokeWidth={1.5} aria-hidden="true" />
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div>
          <p className="font-extrabold text-base text-[var(--text)] leading-tight">{vendor.name}</p>
          {vendor.slogan && (
            <p className="text-sm text-[var(--muted)] mt-0.5 line-clamp-1">{vendor.slogan}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[11px] px-2 py-0">{tag}</Badge>
          ))}
          {location && (
            <span className="text-[11px] font-bold text-[var(--muted)] flex items-center gap-0.5">
              <MapPin className="h-3 w-3" aria-hidden="true" /> {location}
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
      aria-pressed={isSelected}
      className={`w-full text-left rounded-2xl border-2 transition-[border-color,background-color] duration-150 p-4 flex items-start gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isSelected
          ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand-soft)]'
      }`}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--surface-strong)] flex items-center justify-center flex-shrink-0">
        {logo ? (
          <img src={logo} alt={vendor.name} width={56} height={56} loading="lazy" decoding="async" className="img-outline w-full h-full object-cover" />
        ) : (
          <Store className="h-6 w-6 text-[var(--muted)]" strokeWidth={1.5} aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-sm text-[var(--text)] truncate">{vendor.name}</p>
        {vendor.slogan && (
          <p className="text-xs text-[var(--muted)] truncate mt-0.5">{vendor.slogan}</p>
        )}
        <div className="flex gap-1.5 flex-wrap mt-1.5 items-center">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[11px] px-2 py-0">{tag}</Badge>
          ))}
          {location && (
            <span className="text-[11px] font-bold text-[var(--muted)] flex items-center gap-0.5"><MapPin className="h-3 w-3" aria-hidden="true" /> {location}</span>
          )}
        </div>
      </div>
      {isSelected && <ChevronRight className="h-5 w-5 flex-shrink-0 self-center text-[var(--accent-text)]" strokeWidth={2.5} aria-hidden="true" />}
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
          <img src={logo} alt={vendor.name} width={340} height={192} loading="lazy" decoding="async" className="img-outline w-full h-full object-cover" />
        ) : (
          <Store className="h-10 w-10 text-[var(--muted)]" strokeWidth={1.5} aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 space-y-3">
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--text)] leading-tight">{vendor.name}</h2>
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
          <MapPin className="h-4 w-4" aria-hidden="true" />
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
          <label htmlFor="home-search" className="text-sm font-bold text-[var(--muted)]">Buscar tienda, tag o categoría</label>
          <Input
            id="home-search"
            name="search"
            type="search"
            autoComplete="off"
            defaultValue={search}
            placeholder="Ej. belleza, uñas, spa…"
          />
        </div>
        <div className="min-w-[160px] space-y-1">
          <label htmlFor="home-region" className="text-sm font-bold text-[var(--muted)]">Estado</label>
          <select
            id="home-region"
            name="region"
            defaultValue={region}
            className="select"
          >
            <option value="">Todos los estados</option>
            {MX_STATES.map((s) => (
              <option key={s} value={s.toLowerCase()}>{s}</option>
            ))}
          </select>
        </div>
        <Button type="submit" className="self-end">Buscar</Button>
      </form>

      <p className="text-sm text-[var(--muted)]">
        {vendors.length} tienda{vendors.length !== 1 ? 's' : ''} encontrada{vendors.length !== 1 ? 's' : ''}
      </p>

      {vendors.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted)]">
          <Search className="mx-auto mb-3 h-10 w-10" strokeWidth={1.5} aria-hidden="true" />
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
              <div className="sticky top-6 border-2 border-[var(--border)] rounded-3xl bg-[var(--surface)] p-6 self-start">
                <VendorPreview vendor={selected} baseUrl={baseUrl} />
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
