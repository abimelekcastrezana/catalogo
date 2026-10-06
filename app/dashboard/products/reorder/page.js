import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import Link from 'next/link';
import SortableProductsByCategory from '@/app/components/SortableProductsByCategory';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function DashboardProductsReorderPage() {
  const session = await getUserSession();
  if (!session) {
    return (
      <main className="page-shell">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-[var(--text)]">Sesión requerida.</p>
            <Link href="/login"><Button>Iniciar sesión</Button></Link>
          </CardContent>
        </Card>
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
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="page-title">Reordenar productos</CardTitle>
              <p className="page-subtitle">Arrastra para organizar el orden de tus productos por categoría.</p>
            </div>
            <Link href="/dashboard/products">
              <Button variant="outline"><ArrowLeft aria-hidden="true" /> Volver</Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardContent className="pt-6">
          <SortableProductsByCategory
            products={productsPlain}
            categories={categoriesPlain}
            reorderEndpoint={`/api/vendors/${session.user.vendorId}/products/reorder`}
          />
        </CardContent>
      </Card>
    </main>
  );
}
