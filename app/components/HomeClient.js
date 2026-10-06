'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Store, Search, ChevronDown, MessageCircle, X } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import OnlineIndicator from '@/app/components/OnlineIndicator';
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

// Chips con canto inferior: mismo lenguaje que los botones con volumen.
const CHIP =
  'inline-flex h-10 flex-shrink-0 items-center gap-1.5 rounded-lg border-2 px-4 text-sm font-bold whitespace-nowrap transition-[background-color,border-color,box-shadow,transform] duration-100 ease-out active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const CHIP_ON =
  'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)] shadow-[0_2px_0_0_var(--accent)]';
const CHIP_OFF =
  'border-[var(--border-strong)] bg-[var(--card)] text-[var(--text)] shadow-[0_2px_0_0_var(--border-strong)] hover:bg-[var(--accent-soft)]';

/* ── Tarjeta de tienda: un clic y entras al catálogo ── */
function VendorCard({ vendor }) {
  const logo = logoSrc(vendor.logoUrl);
  const tags = [vendor.tag1, vendor.tag2].filter(Boolean);
  const location = regionLabel(vendor);

  return (
    <Link
      href={`/${vendor.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[var(--brand-soft)] hover:shadow-card active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--surface-strong)] flex items-center justify-center">
        {logo ? (
          <img
            src={logo}
            alt=""
            width={400}
            height={300}
            loading="lazy"
            decoding="async"
            className="img-outline h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Store className="h-12 w-12 text-[var(--muted)]" strokeWidth={1.5} aria-hidden="true" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="min-w-0">
          <h3 className="m-0 truncate text-base font-extrabold leading-tight text-[var(--text)]">{vendor.name}</h3>
          {vendor.slogan && (
            <p className="m-0 mt-0.5 line-clamp-2 text-sm text-[var(--muted)]">{vendor.slogan}</p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          <OnlineIndicator isOnline={vendor.isOnline ?? true} />
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="px-2 py-0 text-[11px]">{tag}</Badge>
          ))}
        </div>

        {location && (
          <p className="m-0 flex items-center gap-1 text-xs font-bold text-[var(--muted)]">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{location}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

/* ── Main ── */
export default function HomeClient({ vendors, tags, search, region, whatsappPhone }) {
  const router = useRouter();
  const [query, setQuery] = useState(search || '');

  const go = ({ q = search, r = region } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (r) params.set('region', r);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    go({ q: query.trim() });
  };

  const hasFilters = Boolean(search || region);
  const activeTag = tags.find((t) => t.toLowerCase() === search);
  const regionName = MX_STATES.find((s) => s.toLowerCase() === region);

  const ctaHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hola, quiero crear mi tienda en TiendaTap')}`
    : null;

  return (
    <main className="mx-auto max-w-[1200px] space-y-6 px-4 py-4 sm:px-6 sm:py-8">
      {/* Encabezado + buscador */}
      <section className="space-y-4">
        <div className="space-y-1.5">
          <h2 className="m-0 text-2xl font-extrabold leading-tight sm:text-4xl">
            Encuentra tiendas cerca de ti y pide por WhatsApp
          </h2>
          <p className="m-0 text-[var(--muted)] sm:text-lg">
            Catálogos de negocios locales, sin descargar nada. Elige, arma tu pedido y listo.
          </p>
        </div>

        <form onSubmit={handleSubmit} role="search" className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              type="search"
              name="search"
              aria-label="Buscar tienda, etiqueta o categoría"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca una tienda…"
              autoComplete="off"
              spellCheck={false}
              className="input h-12 w-full"
              style={{ paddingLeft: '2.9rem' }}
            />
          </div>
          <Button type="submit" size="lg" className="flex-shrink-0">Buscar</Button>
        </form>
      </section>

      {/* Filtros rápidos: estado + etiquetas existentes */}
      <section aria-label="Filtros" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1.5 pt-0.5">
        <div className="relative flex-shrink-0">
          <select
            aria-label="Filtrar por estado"
            value={region}
            onChange={(e) => go({ r: e.target.value })}
            className={`${CHIP} ${region ? CHIP_ON : CHIP_OFF} cursor-pointer appearance-none pr-9`}
          >
            <option value="">Todos los estados</option>
            {MX_STATES.map((s) => (
              <option key={s} value={s.toLowerCase()}>{s}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" strokeWidth={2} aria-hidden="true" />
        </div>

        {tags.map((tag) => {
          const active = tag.toLowerCase() === search;
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={active}
              onClick={() => { setQuery(active ? '' : tag); go({ q: active ? '' : tag }); }}
              className={`${CHIP} ${active ? CHIP_ON : CHIP_OFF}`}
            >
              {tag}
            </button>
          );
        })}
      </section>

      {/* Resultado */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="m-0 text-sm font-bold text-[var(--muted)] tabular-nums" aria-live="polite">
          {vendors.length} tienda{vendors.length !== 1 ? 's' : ''}
          {regionName ? ` en ${regionName}` : ''}
          {search && !activeTag ? ` para “${search}”` : ''}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => { setQuery(''); router.push('/'); }}
            className="hit inline-flex items-center gap-1 text-sm font-bold text-[var(--accent-text)] hover:underline focus-visible:outline-none focus-visible:underline"
          >
            <X className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" /> Quitar filtros
          </button>
        )}
      </div>

      {vendors.length === 0 ? (
        <div className="py-12 text-center text-[var(--muted)]">
          <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
            <Search className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <p className="m-0 font-extrabold text-[var(--text)]">No encontramos tiendas con esos filtros</p>
          <p className="m-0 mt-1 text-sm">Prueba con otra palabra o quita los filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}

      {/* Franja para vendedores */}
      <section className="flex flex-col items-start gap-4 rounded-3xl border-2 border-[var(--accent)] bg-[var(--accent-soft)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="space-y-1">
          <h2 className="m-0 text-xl font-extrabold sm:text-2xl">¿Tienes un negocio? Crea tu tienda</h2>
          <p className="m-0 max-w-xl text-[var(--muted)]">
            Sube tus productos, comparte tu enlace y recibe los pedidos directo en tu WhatsApp.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <Button asChild size="lg">
            <Link href="/register">Crear mi tienda</Link>
          </Button>
          {ctaHref && (
            <Button asChild size="lg" variant="outline">
              <a href={ctaHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" /> Hablar con nosotros
              </a>
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
