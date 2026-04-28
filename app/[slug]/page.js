import db from '@/db/index.js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicProductCard from '@/app/components/PublicProductCard';
import PublicVendorHeaderActions from '@/app/components/PublicVendorHeaderActions';
import VendorPageClient from '@/app/components/VendorPageClient';
import CategorySelect from '@/app/components/CategorySelect';

export const revalidate = 0;

export default async function VendorPublicPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { slug } = resolvedParams;
  const categoryId = resolvedSearchParams?.categoryId || '';
  const rawPage = parseInt(resolvedSearchParams?.page ?? '1', 10);
  const currentPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const pageSize = 10;

  const vendor = await db.Vendor.findOne({ where: { slug } });
  if (!vendor || !vendor.isActive) return notFound();

  const categoryModels = await db.Category.findAll({ where: { vendorId: vendor.id }, order: [['position', 'ASC'], ['name', 'ASC']] });
  const categories = categoryModels.map((c) => c.get({ plain: true }));
  const productWhere = { vendorId: vendor.id, isActive: true };
  if (categoryId) {
    productWhere.categoryId = categoryId;
  }

  const totalProducts = await db.Product.count({ where: productWhere });
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const pageToFetch = currentPage > totalPages ? totalPages : currentPage;
  const offset = (pageToFetch - 1) * pageSize;

  const productModels = await db.Product.findAll({
    where: productWhere,
    include: [
      { model: db.ProductImage, order: [['position', 'ASC']] },
      { model: db.Category },
    ],
    order: [['position', 'ASC'], ['createdAt', 'DESC']],
    limit: pageSize,
    offset,
  });

  const products = productModels.map((p) => p.get({ plain: true }));
  const buildPageHref = (targetPage) => {
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId);
    if (targetPage > 1) params.set('page', targetPage.toString());
    return `/${slug}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const vendorPhone = vendor.whatsappPhone ? vendor.whatsappPhone.replace(/[^0-9+]/g, '') : '';
  const vendorContactHref = vendorPhone ? `https://wa.me/${vendorPhone.replace(/^\+/, '')}?text=${encodeURIComponent(`Hola, estoy interesado en tu tienda ${vendor.name}`)}` : null;

  return (
    <VendorPageClient vendorSlug={slug} vendorPhone={vendorPhone} vendorName={vendor.name}>
      <main className="page-shell">
        <section className="page-card">
        <style>{`
          @media (max-width: 768px) {
            .vendor-header { text-align: center; }
            .vendor-header-content { flex-direction: column; align-items: center; }
            .vendor-logo { margin-bottom: 1rem; }
            .vendor-actions { margin-bottom: 1rem; }
            .vendor-form { display: grid; gap: 0.75rem; }
          }
          @media (min-width: 769px) {
            .vendor-header { text-align: left; }
            .vendor-header-content { flex-direction: row; align-items: flex-start; }
            .vendor-logo { margin-right: 1rem; margin-bottom: 0; flex-shrink: 0; }
            .vendor-actions { margin-left: auto; }
            .vendor-form { display: flex; align-items: flex-end; gap: 0.75rem; flex-wrap: wrap; }
          }
        `}</style>
        
        <div className="vendor-header-content" style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '0', left: '0' }} className="theme-switcher-mobile">
            <PublicVendorHeaderActions />
          </div>
          <style>{`
            @media (min-width: 769px) {
              .theme-switcher-mobile {
                display: none !important;
              }
            }
          `}</style>
          <div className="vendor-logo" style={{ display: 'flex', justifyContent: 'center' }}>
            {vendor.logoUrl && (
              <img
                src={vendor.logoUrl.startsWith('/') ? `/api/uploads${vendor.logoUrl.replace(/^\/uploads\/?/, '/')}` : vendor.logoUrl}
                alt={`${vendor.name} logo`}
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '18px', boxShadow: '0 18px 40px rgba(15,23,42,0.08)' }}
              />
            )}
          </div>
          
          <div className="vendor-header" style={{ flex: 1, minWidth: 0 }}>
            <h1 className="page-title" style={{ marginTop: 0, marginBottom: '0.35rem' }}>{vendor.name}</h1>
            <p className="page-subtitle" style={{ marginBottom: '1rem' }}>{vendor.slogan || 'Catálogo público del vendedor.'}</p>

            <div className="vendor-actions" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'flex-start' }} className="theme-switcher-desktop">
              <PublicVendorHeaderActions />
              {vendorContactHref && (
                <a
                  href={vendorContactHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-button"
                  style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', padding: 'clamp(0.6rem, 1vw, 0.85rem) clamp(0.8rem, 2vw, 1.1rem)' }}
                >
                  Contactar tienda
                </a>
              )}
              <style>{`
                @media (max-width: 768px) {
                  .theme-switcher-desktop {
                    display: none !important;
                  }
                }
              `}</style>
            </div>
          </div>
        </div>

        <CategorySelect categories={categories} currentCategoryId={categoryId} />

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
          <p style={{ margin: 0, color: 'var(--muted)' }}>Página {pageToFetch} de {totalPages} · {totalProducts} producto{totalProducts === 1 ? '' : 's'}</p>
        </div>
      </section>

      <section>
        {products.length ? (
          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(2, 1fr)',
            }}
            className="products-grid"
          >
            <style>{`
              @media (min-width: 769px) {
                .products-grid {
                  grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr)) !important;
                }
              }
            `}</style>
            {products.map((product) => (
              <PublicProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p>No hay productos activos para esta tienda.</p>
        )}
      </section>

      {totalPages > 1 && (
        <div className="pagination-row" style={{ marginTop: '1rem' }}>
          {pageToFetch > 1 && (
            <Link href={buildPageHref(pageToFetch - 1)} className="secondary-button" style={{ padding: '0.5rem 0.85rem' }}>
              Anterior
            </Link>
          )}
          <span>Página {pageToFetch} de {totalPages}</span>
          {pageToFetch < totalPages && (
            <Link href={buildPageHref(pageToFetch + 1)} className="secondary-button" style={{ padding: '0.5rem 0.85rem' }}>
              Siguiente
            </Link>
          )}
        </div>
      )}
      </main>
    </VendorPageClient>
  );
}
