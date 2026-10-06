import Link from 'next/link';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import AddProductCard from '@/app/dashboard/products/AddProductCard';
import ProductRow from '@/app/dashboard/products/ProductRow';
import BackButton from '@/app/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export default async function AdminVendorProductsPage({ params, searchParams }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return (
      <main className="page-shell">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-[var(--text)]">Necesitas iniciar sesión como admin.</p>
            <Link href="/login"><Button>Ir a login</Button></Link>
          </CardContent>
        </Card>
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
      <main className="page-shell">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="pt-6 text-center">
            <p className="text-[var(--text)]">Tienda no encontrada.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const categoryModels = await db.Category.findAll({
    where: { vendorId },
    order: [['position', 'ASC'], ['name', 'ASC']],
  });
  const categories = categoryModels.map((c) => c.get({ plain: true }));

  const productWhere = { vendorId };
  if (categoryId) productWhere.categoryId = categoryId;

  const productModels = await db.Product.findAll({
    where: productWhere,
    include: [
      { model: db.ProductImage, order: [['position', 'ASC']] },
      { model: db.Category },
      { model: db.ProductVariant, order: [['position', 'ASC']] },
    ],
    order: [['position', 'ASC'], ['createdAt', 'DESC']],
  });
  const products = productModels.map((p) => p.get({ plain: true }));

  return (
    <main className="page-shell">
      {/* Header */}
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="page-title">Productos de {vendor.name}</CardTitle>
              <p className="text-sm text-[var(--muted)] mt-1">
                {products.length} producto{products.length !== 1 ? 's' : ''}
              </p>
            </div>
            <BackButton fallback="/admin" />
          </div>
          <div className="flex gap-2 flex-wrap pt-2">
            <AddProductCard vendorId={vendorId} categories={categories} apiBase="/api/admin/vendors" />
            <Link href={`/admin/vendors/${vendorId}/products/reorder`}>
              <Button variant="outline" size="sm">Reordenar</Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Grid de productos */}
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardContent className="pt-6">
          {products.length === 0 ? (
            <p className="text-center text-[var(--muted)] py-8">No hay productos en esta tienda.</p>
          ) : (
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))]">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  vendorId={vendorId}
                  categories={categories}
                  apiBase="/api/admin/vendors"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
