import { getUserSession } from '../../../lib/auth/getSession';
import db from '../../../db/index.js';
import Link from 'next/link';
import AddProductForm from './AddProductForm';
import ProductRow from './ProductRow';

async function getCategories(vendorId) {
  return db.Category.findAll({ where: { vendorId }, order: [['name', 'ASC']] });
}

export default async function DashboardProductsPage() {
  const session = await getUserSession();
  if (!session) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>No autorizado</h1>
        <Link href="/login">Iniciar sesión</Link>
      </main>
    );
  }

  const productModels = await db.Product.findAll({
    where: { vendorId: session.user.vendorId },
    order: [['createdAt', 'DESC']],
    include: [{ model: db.ProductImage, order: [['position', 'ASC']] }],
  });
  const products = productModels.map((p) => p.get({ plain: true }));
  const categoryModels = await getCategories(session.user.vendorId);
  const categories = categoryModels.map((c) => c.get({ plain: true }));

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Dashboard - Productos</h1>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {products.map((p) => (
          <ProductRow
            key={p.id}
            product={p}
            vendorId={session.user.vendorId}
            categories={categories}
          />
        ))}
      </div>
      <p>Agregar producto:</p>
      <AddProductForm vendorId={session.user.vendorId} categories={categories} />
      <p style={{ marginTop: '1rem' }}><Link href="/dashboard">Volver</Link></p>
    </main>
  );
}
