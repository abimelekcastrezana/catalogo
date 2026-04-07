import db from '@/db/index.js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicProductCard from '@/app/components/PublicProductCard';

export default async function VendorPublicPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { slug } = resolvedParams;
  const categoryId = resolvedSearchParams?.categoryId || '';

  const vendor = await db.Vendor.findOne({ where: { slug } });
  if (!vendor) return notFound();

  const categories = await db.Category.findAll({ where: { vendorId: vendor.id }, order: [['name', 'ASC']] });
  const productWhere = { vendorId: vendor.id, isActive: true };
  if (categoryId) {
    productWhere.categoryId = categoryId;
  }

  const productModels = await db.Product.findAll({
    where: productWhere,
    include: [
      { model: db.ProductImage, order: [['position', 'ASC']] },
      { model: db.Category },
    ],
    order: [['createdAt', 'DESC']],
  });

  const products = productModels.map((p) => p.get({ plain: true }));

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
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
        <h2>Productos {categoryId ? `- ${categories.find((cat) => cat.id === categoryId)?.name || 'Seleccionado'}` : '- Todas'}</h2>
      </section>

      <section>
        {products.length ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {products.map((product) => (
              <PublicProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p>No hay productos activos para esta tienda.</p>
        )}
      </section>
    </main>
  );
}
