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
    <main className="page-shell">
      <section className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Dashboard - Productos</h1>
            <p className="page-subtitle">Administra tus productos con un panel cómodo y rápido.</p>
          </div>
          <ProductFilter categories={categories} />
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <AddProductCard vendorId={session.user.vendorId} categories={categories} />
          <Link href="/dashboard" className="secondary-button">Volver</Link>
        </div>
      </section>

      <section className="page-card">
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
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

        <p style={{ marginTop: '1.5rem', color: 'var(--muted)' }}>
          Mostrando {products.length} de {totalProducts} producto{totalProducts === 1 ? '' : 's'}
        </p>

        {totalPages > 1 && (
          <div className="pagination-row" style={{ marginTop: '1.25rem' }}>
            {pageToFetch > 1 && (
              <Link href={buildPageLink(pageToFetch - 1)} className="secondary-button" style={{ padding: '0.5rem 0.85rem' }}>
                Anterior
              </Link>
            )}
            <span>Pagina {pageToFetch} de {totalPages}</span>
            {pageToFetch < totalPages && (
              <Link href={buildPageLink(pageToFetch + 1)} className="secondary-button" style={{ padding: '0.5rem 0.85rem' }}>
                Siguiente
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
