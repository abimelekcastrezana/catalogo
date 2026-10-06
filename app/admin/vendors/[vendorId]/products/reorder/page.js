import Link from 'next/link';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import BackButton from '@/app/components/BackButton';
import SortableProductsByCategory from '@/app/components/SortableProductsByCategory';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export default async function AdminVendorProductsReorderPage({ params }) {
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
  const vendor = await db.Vendor.findByPk(vendorId);
  if (!vendor) {
    return (
      <main className="page-shell">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-[var(--text)]">Tienda no encontrada.</p>
            <Link href="/admin"><Button variant="outline">Volver al admin</Button></Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const [products, categories] = await Promise.all([
    db.Product.findAll({
      where: { vendorId },
      order: [['position', 'ASC'], ['createdAt', 'DESC']],
      include: [{ model: db.Category }],
    }),
    db.Category.findAll({
      where: { vendorId },
      order: [['position', 'ASC'], ['name', 'ASC']],
    }),
  ]);

  return (
    <main className="page-shell">
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="page-title">Reordenar productos</CardTitle>
              <p className="page-subtitle">{vendor.name} — arrastra para organizar por categoría.</p>
            </div>
            <BackButton fallback={`/admin/vendors/${vendorId}/products`} />
          </div>
        </CardHeader>
      </Card>

      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardContent className="pt-6">
          <SortableProductsByCategory
            products={products.map((p) => p.get({ plain: true }))}
            categories={categories.map((c) => c.get({ plain: true }))}
            reorderEndpoint={`/api/admin/vendors/${vendorId}/products/reorder`}
          />
        </CardContent>
      </Card>
    </main>
  );
}
