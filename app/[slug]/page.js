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

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vendor = await db.Vendor.findOne({ where: { slug } });
  if (!vendor) return { title: 'Catálogo' };

  const baseUrl = process.env.NEXTAUTH_URL || 'https://tiendatap.com';
  const rawLogo = vendor.logoUrl;
  const absoluteLogo = rawLogo
    ? rawLogo.startsWith('http')
      ? rawLogo
      : `${baseUrl}/api/uploads${rawLogo.replace(/^\/uploads\/?/, '/')}`
    : `${baseUrl}/tiendatap_logo.jpg`;

  const description = vendor.slogan || `Catálogo digital de ${vendor.name}`;
  const title = `${vendor.name} — TiendaTap`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${slug}`,
      siteName: 'TiendaTap',
      images: [{ url: absoluteLogo, width: 400, height: 400, alt: vendor.name }],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [absoluteLogo],
    },
  };
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

  const productWhere = {
    vendorId: vendor.id,
    isActive: true,
    ...(categoryId ? { categoryId } : {}),
    ...(query ? { name: { [Op.iLike]: `%${query}%` } } : {}),
  };

  const [categoryModels, totalProducts, likeCount] = await Promise.all([
    db.Category.findAll({
      where: { vendorId: vendor.id },
      order: [['position', 'ASC'], ['name', 'ASC']],
    }),
    db.Product.count({ where: productWhere }),
    db.VendorLike.count({ where: { vendorId: vendor.id } }),
  ]);

  const categories = categoryModels.map((c) => c.get({ plain: true }));
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

  const products = productModels.map((p) => p.get({ plain: true }));
  const vendorPhone = vendor.whatsappPhone?.replace(/[^0-9+]/g, '') || '';
  const logoUrl = vendor.logoUrl
    ? vendor.logoUrl.startsWith('/') ? `/api/uploads${vendor.logoUrl.replace(/^\/uploads\/?/, '/')}` : vendor.logoUrl
    : null;

  const buildPageHref = (page) => {
    const p = new URLSearchParams();
    if (categoryId) p.set('categoryId', categoryId);
    if (query) p.set('q', query);
    if (sort) p.set('sort', sort);
    if (page > 1) p.set('page', String(page));
    return `/${slug}${p.toString() ? `?${p}` : ''}`;
  };

  return (
    <VendorPageClient vendorSlug={slug} vendorPhone={vendorPhone} vendorName={vendor.name}>
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 space-y-6">
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
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-card flex-shrink-0"
              />
            )}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] leading-tight">{vendor.name}</h1>
              {vendor.slogan && (
                <p className="text-[var(--muted)] text-sm">{vendor.slogan}</p>
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
                    <Button size="sm">Mensajes</Button>
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
          <CategoryFilterBar vendorSlug={slug} categories={categories} currentCategoryId={categoryId} currentQuery={query} currentSort={sort} />
          <p className="text-sm text-[var(--muted)]">
            {totalProducts} producto{totalProducts !== 1 ? 's' : ''}
            {categoryId ? ' en esta categoría' : ''}
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
            <p className="text-4xl mb-3">📦</p>
            <p>No hay productos en esta categoría.</p>
          </section>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {pageToFetch > 1 && (
              <Link href={buildPageHref(pageToFetch - 1)}>
                <Button variant="outline" size="sm">← Anterior</Button>
              </Link>
            )}
            <span className="text-sm text-[var(--muted)]">
              Página {pageToFetch} de {totalPages}
            </span>
            {pageToFetch < totalPages && (
              <Link href={buildPageHref(pageToFetch + 1)}>
                <Button variant="outline" size="sm">Siguiente →</Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </VendorPageClient>
  );
}
