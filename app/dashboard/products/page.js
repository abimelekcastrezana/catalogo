import { getUserSession } from '../../../lib/auth/getSession';
import db from '../../../db/index.js';
import Link from 'next/link';
import AddProductCard from './AddProductCard';
import ProductFilter from './ProductFilter';
import ProductRow from './ProductRow';

async function getCategories(vendorId) {
  return db.Category.findAll({ where: { vendorId }, order: [['name', 'ASC']] });
}

export default async function DashboardProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const categoryId = resolvedSearchParams?.categoryId || '';
  const rawPage = parseInt(resolvedSearchParams?.page ?? '1', 10);
  const currentPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const itemsPerPage = 10;
  const session = await getUserSession();
  if (!session) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>No autorizado</h1>
        <Link href="/login">Iniciar sesión</Link>
      </main>
    );
  }

  const productWhere = { vendorId: session.user.vendorId };
  if (categoryId) {
    productWhere.categoryId = categoryId;
  }

  const totalProducts = await db.Product.count({ where: productWhere });
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));
  const pageToFetch = currentPage > totalPages ? totalPages : currentPage;
  const offset = (pageToFetch - 1) * itemsPerPage;

  const productModels = await db.Product.findAll({
    where: productWhere,
    order: [['createdAt', 'DESC']],
    include: [
      { model: db.ProductImage, order: [['position', 'ASC']] },
      { model: db.Category },
    ],
    limit: itemsPerPage,
    offset,
  });
  const products = productModels.map((p) => p.get({ plain: true }));
  const categoryModels = await getCategories(session.user.vendorId);
  const categories = categoryModels.map((c) => c.get({ plain: true }));

  const buildPageLink = (targetPage) => {
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId);
    params.set('page', targetPage.toString());
    return `/dashboard/products?${params.toString()}`;
  };

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Dashboard - Productos</h1>
          <p style={{ margin: '0.25rem 0 0' }}>Administra tus productos y categorías.</p>
        </div>
        <ProductFilter categories={categories} />
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <AddProductCard vendorId={session.user.vendorId} categories={categories} />
          <Link href="/dashboard" style={{ padding: '0.65rem 1rem', border: '1px solid #ccc', borderRadius: '8px', textDecoration: 'none', color: '#000' }}>
            Volver
          </Link>
        </div>
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns:
              products.length === 1
                ? '1fr'
                : products.length === 2
                ? 'repeat(2, minmax(320px, 1fr))'
                : 'repeat(auto-fit, minmax(240px, 1fr))',
            justifyContent: products.length <= 2 ? 'center' : 'stretch',
            margin: products.length <= 2 ? '0 auto' : undefined,
            maxWidth: products.length <= 2 ? 'calc(2 * 320px + 1rem)' : '100%',
          }}
        >
          {products.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              vendorId={session.user.vendorId}
              categories={categories}
            />
          ))}
        </div>
      </div>

      <p style={{ marginTop: '1rem', color: '#555' }}>
        Mostrando {products.length} de {totalProducts} producto{totalProducts === 1 ? '' : 's'}
      </p>

      {totalPages > 1 && (
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {pageToFetch > 1 && (
            <Link href={buildPageLink(pageToFetch - 1)} style={{ padding: '0.5rem 0.85rem', border: '1px solid #ccc', borderRadius: '8px' }}>
              Anterior
            </Link>
          )}
          <span>Pagina {pageToFetch} de {totalPages}</span>
          {pageToFetch < totalPages && (
            <Link href={buildPageLink(pageToFetch + 1)} style={{ padding: '0.5rem 0.85rem', border: '1px solid #ccc', borderRadius: '8px' }}>
              Siguiente
            </Link>
          )}
        </div>
      )}

      <p style={{ marginTop: '1rem' }}><Link href="/dashboard">Volver</Link></p>
    </main>
  );
}
