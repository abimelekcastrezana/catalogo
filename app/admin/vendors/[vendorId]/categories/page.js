import Link from 'next/link';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import AddVendorCategoryForm from '../AddVendorCategoryForm';
import BackButton from '@/app/components/BackButton';
import SortableCategoryList from '@/app/components/SortableCategoryList';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default async function AdminVendorCategoriesPage({ params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return (
      <main className="page-shell">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-[var(--text)]">Necesitas iniciar sesión como admin.</p>
            <Link href="/login" className="primary-button">Ir a login</Link>
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
          <CardContent className="pt-6 text-center">
            <p className="text-[var(--text)]">Tienda no encontrada.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const categories = await db.Category.findAll({
    where: { vendorId },
    order: [['position', 'ASC'], ['name', 'ASC']],
  });

  return (
    <main className="page-shell">
      <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="page-title">Categorías de {vendor.name}</CardTitle>
              <p className="text-sm text-[var(--muted)] mt-1">Administra y reordena las categorías de esta tienda.</p>
            </div>
            <BackButton fallback="/admin" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Crear categoría */}
        <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Agregar categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <AddVendorCategoryForm vendorId={vendorId} />
          </CardContent>
        </Card>

        {/* Ordenar y editar */}
        <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Ordenar categorías</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SortableCategoryList
              categories={categories.map((c) => c.get({ plain: true }))}
              reorderEndpoint={`/api/admin/vendors/${vendorId}/categories/reorder`}
              deleteEndpoint={`/api/admin/vendors/${vendorId}/categories`}
              editEndpoint={`/api/admin/vendors/${vendorId}/categories`}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
