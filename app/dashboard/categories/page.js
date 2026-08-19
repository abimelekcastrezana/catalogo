import { getUserSession } from '../../../lib/auth/getSession';
import db from '../../../db/index.js';
import Link from 'next/link';
import AddCategoryForm from './AddCategoryForm';
import SortableCategoryList from '../../components/SortableCategoryList';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export default async function DashboardCategoriesPage() {
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

  const categories = await db.Category.findAll({
    where: { vendorId: session.user.vendorId },
    order: [['position', 'ASC'], ['name', 'ASC']],
  });
  const categoriesPlain = categories.map((c) => c.get({ plain: true }));

  return (
    <main className="page-shell">
      {/* Header */}
      <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="page-title">Categorías</CardTitle>
              <p className="page-subtitle">
                {categoriesPlain.length} categoría{categoriesPlain.length !== 1 ? 's' : ''} en tu tienda
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">← Volver</Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Agregar categoría */}
        <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Agregar categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <AddCategoryForm vendorId={session.user.vendorId} />
          </CardContent>
        </Card>

        {/* Ordenar categorías */}
        <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Ordenar categorías</CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesPlain.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Aún no tienes categorías. Créa la primera.</p>
            ) : (
              <SortableCategoryList
                categories={categoriesPlain}
                reorderEndpoint={`/api/vendors/${session.user.vendorId}/categories/reorder`}
                deleteEndpoint={`/api/vendors/${session.user.vendorId}/categories`}
                editEndpoint={`/api/vendors/${session.user.vendorId}/categories`}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
