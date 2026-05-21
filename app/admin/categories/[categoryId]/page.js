import Link from 'next/link';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import EditCategoryForm from '../EditCategoryForm';
import BackButton from '@/app/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export default async function AdminCategoryEditPage({ params }) {
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
  const [category, vendors] = await Promise.all([
    db.Category.findByPk(resolvedParams.categoryId, { include: [{ model: db.Vendor }] }),
    db.Vendor.findAll({ order: [['name', 'ASC']] }),
  ]);

  if (!category) {
    return (
      <main className="page-shell">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-[var(--text)]">Categoría no encontrada.</p>
            <Link href="/admin/categories"><Button variant="outline">Volver a categorías</Button></Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="page-title">Editar categoría</CardTitle>
              <p className="text-sm text-[var(--muted)] mt-1">
                {category.name} · {category.Vendor?.name || 'Sin tienda'}
              </p>
            </div>
            <BackButton fallback="/admin/categories" />
          </div>
        </CardHeader>
      </Card>

      <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
        <CardContent className="pt-6">
          <EditCategoryForm
            category={category.get({ plain: true })}
            vendors={vendors.map((v) => v.get({ plain: true }))}
          />
        </CardContent>
      </Card>
    </main>
  );
}
