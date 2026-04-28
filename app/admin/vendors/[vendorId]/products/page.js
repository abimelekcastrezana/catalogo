import Link from 'next/link';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import AddProductCard from '@/app/dashboard/products/AddProductCard';
import ProductRow from '@/app/dashboard/products/ProductRow';
import BackButton from '@/app/components/BackButton';

export default async function AdminVendorProductsPage({ params, searchParams }) {
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
  const resolvedSearchParams = await searchParams;
  const categoryId = resolvedSearchParams?.categoryId || '';

  const vendor = await db.Vendor.findByPk(vendorId);
  if (!vendor) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Tienda no encontrada</h1>
        <Link href="/admin">Volver al admin</Link>
      </main>
    );
  }

  const categoryWhere = { vendorId };
  const productWhere = { vendorId };
  if (categoryId) {
    productWhere.categoryId = categoryId;
  }

  const categoryModels = await db.Category.findAll({ where: categoryWhere, order: [['position', 'ASC'], ['name', 'ASC']] });
  const categories = categoryModels.map((category) => category.get({ plain: true }));
  const productModels = await db.Product.findAll({ where: productWhere, include: [{ model: db.ProductImage, order: [['position', 'ASC']] }, { model: db.Category }], order: [['position', 'ASC'], ['createdAt', 'DESC']] });
  const products = productModels.map((p) => p.get({ plain: true }));

  return (
    <main className="page-shell">
      <section className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Productos de {vendor.name}</h1>
            <p className="page-subtitle">Edita productos directamente como admin.</p>
          </div>
          <BackButton />
        </div>
      </section>

      <section className="page-card">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <AddProductCard vendorId={vendorId} categories={categories} apiBase="/api/admin/vendors" />
          <Link href={`/admin/vendors/${vendorId}/products/reorder`} className="secondary-button">Reordenar</Link>
        </div>
      </section>

      <section className="page-card">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))' }}>
          {products.map((product) => (
            <ProductRow key={product.id} product={product} vendorId={vendorId} categories={categories} apiBase="/api/admin/vendors" />
          ))}
        </div>
      </section>
    </main>
  );
}
