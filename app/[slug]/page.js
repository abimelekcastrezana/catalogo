import db from '@/db/index.js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicProductCard from '@/app/components/PublicProductCard';

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

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <Link href="/">Volver al inicio</Link>
      <h1>{vendor.name}</h1>
      <p>{vendor.slogan || 'Catálogo público del vendedor.'}</p>

      <section style={{ marginBottom: '1.5rem' }}>
        <form method="get" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            Categoría
            <select name="categoryId" defaultValue={categoryId} style={{ padding: '0.5rem', minWidth: '220px' }}>
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" style={{ padding: '0.6rem 1rem' }}>Filtrar</button>
        </form>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Productos {categoryId ? `- ${categories.find((cat) => String(cat.id) === String(categoryId))?.name || 'Seleccionado'}` : '- Todas'}</h2>
        <p style={{ margin: '0.5rem 0 0' }}>Página {pageToFetch} de {totalPages} · {totalProducts} producto{totalProducts === 1 ? '' : 's'}</p>
      </section>

      <section>
        {products.length ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: products.length <= 2 ? 'repeat(auto-fit, minmax(280px, 320px))' : 'repeat(auto-fit, minmax(240px, 1fr))',
              gridAutoRows: 'auto',
              gap: '1rem',
              alignItems: 'start',
              justifyContent: products.length <= 2 ? 'center' : 'stretch',
              margin: products.length <= 2 ? '0 auto' : undefined,
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
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {pageToFetch > 1 && (
            <Link href={buildPageHref(pageToFetch - 1)} style={{ padding: '0.5rem 0.85rem', border: '1px solid #ccc', borderRadius: '8px' }}>
              Anterior
            </Link>
          )}
          <span>Página {pageToFetch} de {totalPages}</span>
          {pageToFetch < totalPages && (
            <Link href={buildPageHref(pageToFetch + 1)} style={{ padding: '0.5rem 0.85rem', border: '1px solid #ccc', borderRadius: '8px' }}>
              Siguiente
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
