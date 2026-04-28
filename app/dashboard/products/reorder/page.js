import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import Link from 'next/link';
import SortableProductsByCategory from '@/app/components/SortableProductsByCategory';

export default async function DashboardProductsReorderPage() {
  const session = await getUserSession();
  if (!session) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>No autorizado</h1>
        <Link href="/login">Iniciar sesión</Link>
      </main>
    );
  }

  const products = await db.Product.findAll({
    where: { vendorId: session.user.vendorId },
    order: [['position', 'ASC'], ['createdAt', 'DESC']],
    include: [{ model: db.Category }],
  });

  const categories = await db.Category.findAll({
    where: { vendorId: session.user.vendorId },
    order: [['position', 'ASC'], ['name', 'ASC']],
  });

  const productsPlain = products.map((p) => p.get({ plain: true }));
  const categoriesPlain = categories.map((c) => c.get({ plain: true }));

  return (
    <main className="page-shell">
      <section className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Reordenar Productos</h1>
            <p className="page-subtitle">Organiza tus productos por categoría de forma intuitiva.</p>
          </div>
          <Link href="/dashboard/products" className="secondary-button">Volver</Link>
        </div>
      </section>

      <section className="page-card">
        <SortableProductsByCategory
          products={productsPlain}
          categories={categoriesPlain}
          reorderEndpoint={`/api/vendors/${session.user.vendorId}/products/reorder`}
        />
      </section>
    </main>
  );
}
