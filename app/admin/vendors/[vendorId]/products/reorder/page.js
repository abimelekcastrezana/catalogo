import Link from 'next/link';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import BackButton from '@/app/components/BackButton';
import SortableProductsByCategory from '@/app/components/SortableProductsByCategory';

export default async function AdminVendorProductsReorderPage({ params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>No autorizado</h1>
        <p>Necesitas iniciar sesión como admin.</p>
        <Link href="/login">Ir a login</Link>
      </main>
    );
  }

  const resolvedParams = await params;
  const vendorId = resolvedParams.vendorId;
  const vendor = await db.Vendor.findByPk(vendorId);
  if (!vendor) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Tienda no encontrada</h1>
        <Link href="/admin">Volver al admin</Link>
      </main>
    );
  }

  const products = await db.Product.findAll({
    where: { vendorId },
    order: [['position', 'ASC'], ['createdAt', 'DESC']],
    include: [{ model: db.Category }],
  });

  const categories = await db.Category.findAll({
    where: { vendorId },
    order: [['position', 'ASC'], ['name', 'ASC']],
  });

  const productsPlain = products.map((p) => p.get({ plain: true }));
  const categoriesPlain = categories.map((c) => c.get({ plain: true }));

  return (
    <main className="page-shell">
      <section className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Reordenar Productos de {vendor.name}</h1>
            <p className="page-subtitle">Organiza los productos de la tienda por categoría.</p>
          </div>
          <BackButton />
        </div>
      </section>

      <section className="page-card">
        <SortableProductsByCategory
          products={productsPlain}
          categories={categoriesPlain}
          reorderEndpoint={`/api/admin/vendors/${vendorId}/products/reorder`}
        />
      </section>
    </main>
  );
}
