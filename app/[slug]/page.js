import db from '@/db/index.js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicProductCard from '@/app/components/PublicProductCard';
import PublicVendorHeaderActions from '@/app/components/PublicVendorHeaderActions';

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

  const categories = await db.Category.findAll({ where: { vendorId: vendor.id }, order: [['name', 'ASC']] });
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
    order: [['createdAt', 'DESC']],
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
    <main className="page-shell">
      <section className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: '1', minWidth: 0, alignItems: 'flex-start' }}>
            {vendor.logoUrl && (
              <img
                src={vendor.logoUrl.startsWith('/') ? `/api/uploads${vendor.logoUrl.replace(/^\/uploads\/?/, '/')}` : vendor.logoUrl}
                alt={`${vendor.name} logo`}
                style={{ width: '86px', height: '86px', objectFit: 'cover', borderRadius: '18px', boxShadow: '0 18px 40px rgba(15,23,42,0.08)' }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <h1 className="page-title" style={{ marginTop: '1rem' }}>{vendor.name}</h1>
              <p className="page-subtitle">{vendor.slogan || 'Catálogo público del vendedor.'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
            <PublicVendorHeaderActions />
            {vendorContactHref && (
              <a
                href={vendorContactHref}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-button"
                style={{ alignSelf: 'flex-start', marginTop: '1rem' }}
              >
                Contactar tienda
              </a>
            )}
          </div>
        </div>

        <form method="get" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '240px', flex: '1' }}>
            Categoría
            <select name="categoryId" defaultValue={categoryId} className="select" style={{ width: '100%' }}>
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="secondary-button">Filtrar</button>
        </form>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <p style={{ margin: 0, color: 'var(--muted)' }}>Página {pageToFetch} de {totalPages} · {totalProducts} producto{totalProducts === 1 ? '' : 's'}</p>
        </div>
      </section>

      <section>
        {products.length ? (
          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
            }}
          >
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
  );
}
