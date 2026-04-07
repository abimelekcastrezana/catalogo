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

  const productModels = await db.Product.findAll({
    where: productWhere,
    order: [['createdAt', 'DESC']],
    include: [
      { model: db.ProductImage, order: [['position', 'ASC']] },
      { model: db.Category },
    ],
  });
  const products = productModels.map((p) => p.get({ plain: true }));
  const categoryModels = await getCategories(session.user.vendorId);
  const categories = categoryModels.map((c) => c.get({ plain: true }));

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Dashboard - Productos</h1>
          <p style={{ margin: '0.25rem 0 0' }}>Administra tus productos y categorías.</p>
        </div>
        <ProductFilter categories={categories} />
      </div>

      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <AddProductCard vendorId={session.user.vendorId} categories={categories} />
        {products.map((p) => (
          <ProductRow
            key={p.id}
            product={p}
            vendorId={session.user.vendorId}
            categories={categories}
          />
        ))}
      </div>

      <p style={{ marginTop: '1rem' }}><Link href="/dashboard">Volver</Link></p>
    </main>
  );
}
