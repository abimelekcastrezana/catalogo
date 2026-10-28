import { unstable_noStore } from 'next/cache';
import { Op } from 'sequelize';
import db from '@/db/index.js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicProductCard from '@/app/components/PublicProductCard';
import VendorPageClient from '@/app/components/VendorPageClient';
import CategoryFilterBar from '@/app/components/CategoryFilterBar';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import { Button } from '@/app/components/ui/button';
import LikeButton from '@/app/components/LikeButton';
import OnlineIndicator from '@/app/components/OnlineIndicator';
import LocationButton from '@/app/components/LocationButton';
import StoreTabs from '@/app/components/StoreTabs';
import { ArrowLeft, ArrowRight, Package } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { getPlan, productForPublicPlan, visibleCategories } from '@/app/lib/plans';
import { visibleProductIds } from '@/lib/plan-limits';
import { withSortedRelations } from '@/app/lib/products';
import JsonLd from '@/app/components/JsonLd';
import { SITE_URL, SITE_LOGO } from '@/app/lib/site';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vendor = await db.Vendor.findOne({ where: { slug } });
  if (!vendor) return { title: 'Catálogo' };

  const slogan = (vendor.slogan || '').trim();
  const sloganLead = slogan ? `${slogan}${/[.!?…]$/.test(slogan) ? '' : '.'} ` : '';
  const description = `${sloganLead}Mira el catálogo de ${vendor.name} y haz tu pedido por WhatsApp.`;
  const logo = vendorLogoAbsolute(vendor);

  return {
    title: vendor.name,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: vendor.name,
      description,
      url: `/${slug}`,
      images: [{ url: logo, width: 400, height: 400, alt: vendor.name }],
    },
    twitter: { card: 'summary', title: vendor.name, description, images: [logo] },
  };
}

function vendorLogoAbsolute(vendor) {
  const raw = vendor.logoUrl;
  if (!raw) return `${SITE_URL}${SITE_LOGO}`;
  return raw.startsWith('http') ? raw : `${SITE_URL}/api/uploads${raw.replace(/^\/uploads\/?/, '/')}`;
}

const PAGE_SIZE = 12;

export default async function VendorPublicPage({ params, searchParams }) {
  unstable_noStore();
  const { slug } = await params;
  const resolved = await searchParams;
  const categoryId = resolved?.categoryId || '';
  const query = resolved?.q || '';
  const sort = resolved?.sort || '';
  const rawPage = parseInt(resolved?.page ?? '1', 10);
  const currentPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const vendor = await db.Vendor.findOne({ where: { slug } });
  if (!vendor || !vendor.isActive) return notFound();
  const plan = getPlan(vendor.plan);
  const [allCategoryModels, visibleIds] = await Promise.all([
    db.Category.findAll({
      where: { vendorId: vendor.id },
      order: [['position', 'ASC'], ['name', 'ASC']],
    }),
    visibleProductIds(vendor.id, plan),
  ]);
  // Solo las categorías que entran en el plan; un filtro a otra categoría (vía URL) se ignora.
  const categories = visibleCategories(plan, allCategoryModels.map((c) => c.get({ plain: true })));
  const visibleCategoryIds = new Set(categories.map((c) => c.id));
  const categoryFilter = visibleCategoryIds.has(categoryId) ? categoryId : '';

  const productWhere = {
    vendorId: vendor.id,
    isActive: true,
    ...(visibleIds ? { id: { [Op.in]: visibleIds } } : {}),
    ...(categoryFilter ? { categoryId: categoryFilter } : {}),
    ...(query ? { name: { [Op.iLike]: `%${query}%` } } : {}),
  };

  const [totalProducts, likeCount] = await Promise.all([
    db.Product.count({ where: productWhere }),
    db.VendorLike.count({ where: { vendorId: vendor.id } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const pageToFetch = Math.min(currentPage, totalPages);
  const offset = (pageToFetch - 1) * PAGE_SIZE;

  const SORT_ORDERS = {
    recent: [['createdAt', 'DESC']],
    price_asc: [['price', 'ASC']],
    price_desc: [['price', 'DESC']],
  };
  const productOrder = SORT_ORDERS[sort] || [['position', 'ASC'], ['createdAt', 'DESC']];

  const productModels = await db.Product.findAll({
    where: productWhere,
    include: [
      { model: db.ProductImage, order: [['position', 'ASC']] },
      { model: db.Category },
      { model: db.ProductVariant, order: [['position', 'ASC']] },
    ],
    order: productOrder,
    limit: PAGE_SIZE,
    offset,
  });

  const products = productModels.map((model) => {
    const p = productForPublicPlan(plan, withSortedRelations(model.get({ plain: true })));
    // Producto en una categoría que quedó fuera del plan: se muestra sin categoría.
    return p.categoryId && !visibleCategoryIds.has(p.categoryId) ? { ...p, categoryId: null, Category: null } : p;
  });
  const vendorPhone = vendor.whatsappPhone?.replace(/[^0-9+]/g, '') || '';
  const logoUrl = vendor.logoUrl
    ? vendor.logoUrl.startsWith('/') ? `/api/uploads${vendor.logoUrl.replace(/^\/uploads\/?/, '/')}` : vendor.logoUrl
    : null;

  const buildPageHref = (page) => {
    const p = new URLSearchParams();
    if (categoryFilter) p.set('categoryId', categoryFilter);
    if (query) p.set('q', query);
    if (sort) p.set('sort', sort);
    if (page > 1) p.set('page', String(page));
    return `/${slug}${p.toString() ? `?${p}` : ''}`;
  };

  return (
    <VendorPageClient vendorSlug={slug} vendorPhone={vendorPhone} vendorName={vendor.name}>
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: vendor.name,
          url: `${SITE_URL}/${slug}`,
          image: vendorLogoAbsolute(vendor),
          ...(vendor.slogan ? { description: vendor.slogan } : {}),
          ...((vendor.state || vendor.city) ? {
            address: {
              '@type': 'PostalAddress',
              ...(vendor.city ? { addressLocality: vendor.city } : {}),
              ...(vendor.state ? { addressRegion: vendor.state } : {}),
              addressCountry: 'MX',
            },
          } : {}),
        }} />
        {/* Hero del vendor */}
        <section className="relative">
          {/* ThemeSwitcher — fixed para no afectar el centrado en absoluto */}
          <div className="fixed top-4 right-4 z-40">
            <ThemeSwitcher />
          </div>

          {/* Contenido perfectamente centrado en mobile, fila en desktop */}
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={vendor.name}
                width={96}
                height={96}
                className="img-outline w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover flex-shrink-0"
              />
            )}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] leading-tight">{vendor.name}</h1>
              {vendor.slogan && (
                <p className="text-[var(--muted)] text-sm font-medium">{vendor.slogan}</p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <OnlineIndicator isOnline={vendor.isOnline ?? true} />
              </div>
              <div className="flex items-center gap-3 pt-2 flex-wrap justify-center sm:justify-start">
                {(vendor.state || vendor.city) && (
                  <LocationButton city={vendor.city} state={vendor.state} />
                )}
                {vendorPhone && (
                  <a
                    href={`https://wa.me/${vendorPhone.replace(/^\+/, '')}?text=${encodeURIComponent(`Hola, estoy interesado en tu tienda ${vendor.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="whatsapp"><MessageCircle aria-hidden="true" /> Mensajes</Button>
                  </a>
                )}
                <LikeButton slug={slug} initialCount={likeCount} />
              </div>
            </div>
          </div>
        </section>

        {/* Tabs de la tienda */}
        <StoreTabs />

        {/* Filtros */}
        <section className="flex flex-col gap-3">
          <CategoryFilterBar vendorSlug={slug} categories={categories} currentCategoryId={categoryFilter} currentQuery={query} currentSort={sort} />
          <p className="text-sm font-bold text-[var(--muted)] tabular-nums">
            {totalProducts} producto{totalProducts !== 1 ? 's' : ''}
            {categoryFilter ? ' en esta categoría' : ''}
            {query ? ` que coinciden con "${query}"` : ''}
          </p>
        </section>

        {/* Grid de productos */}
        {products.length > 0 ? (
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <PublicProductCard key={product.id} product={product} />
            ))}
          </section>
        ) : (
          <section className="text-center py-16 text-[var(--muted)]">
            <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-text)]">
              <Package className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p className="m-0 font-extrabold text-[var(--text)]">No hay productos aquí todavía</p>
            <p className="m-0 mt-1 text-sm">Prueba con otra categoría o cambia la búsqueda.</p>
          </section>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {pageToFetch > 1 && (
              <Link href={buildPageHref(pageToFetch - 1)}>
                <Button variant="outline" size="sm"><ArrowLeft aria-hidden="true" /> Anterior</Button>
              </Link>
            )}
            <span className="text-sm font-bold text-[var(--muted)] tabular-nums">
              Página {pageToFetch} de {totalPages}
            </span>
            {pageToFetch < totalPages && (
              <Link href={buildPageHref(pageToFetch + 1)}>
                <Button variant="outline" size="sm">Siguiente <ArrowRight aria-hidden="true" /></Button>
              </Link>
            )}
          </div>
        )}

        {/* Pie: enlace a TiendaTap (cada tienda refuerza la marca y trae vendedores nuevos) */}
        {/* pb-24: deja libre el botón flotante del carrito */}
        <footer className="border-t-2 border-[var(--border)] pt-5 pb-24 text-center">
          <Link
            href="/"
            className="group inline-flex flex-col items-center gap-1 text-sm font-bold text-[var(--muted)]"
          >
            <span className="inline-flex items-center gap-2">
              <img src={SITE_LOGO} alt="" width={20} height={20} className="h-5 w-5 rounded-md" />
              Tienda creada con TiendaTap
            </span>
            <span className="text-[var(--accent-text)] group-hover:underline">Crea la tuya gratis</span>
          </Link>
        </footer>
      </main>
    </VendorPageClient>
  );
}
