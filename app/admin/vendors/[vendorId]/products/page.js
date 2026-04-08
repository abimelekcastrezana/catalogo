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

  const categoryModels = await db.Category.findAll({ where: categoryWhere, order: [['name', 'ASC']] });
  const categories = categoryModels.map((category) => category.get({ plain: true }));
  const productModels = await db.Product.findAll({ where: productWhere, include: [{ model: db.ProductImage, order: [['position', 'ASC']] }, { model: db.Category }], order: [['createdAt', 'DESC']] });
  const products = productModels.map((p) => p.get({ plain: true }));

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Productos de {vendor.name}</h1>
          <p style={{ margin: '0.25rem 0 0' }}>Edita productos directamente como admin.</p>
        </div>
        <BackButton />
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <AddProductCard vendorId={vendorId} categories={categories} apiBase="/api/admin/vendors" />
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
          {products.map((product) => (
            <ProductRow key={product.id} product={product} vendorId={vendorId} categories={categories} apiBase="/api/admin/vendors" />
          ))}
        </div>
      </div>
    </main>
  );
}
