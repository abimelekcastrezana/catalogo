import Link from 'next/link';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import CreateCategoryForm from './CreateCategoryForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export default async function AdminCategoriesPage({ searchParams }) {
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

  const resolvedSearchParams = await searchParams;
  const vendorId = resolvedSearchParams?.vendorId || '';
  const vendors = await db.Vendor.findAll({ order: [['name', 'ASC']] });
  const categoryWhere = vendorId ? { vendorId } : {};
  const categories = await db.Category.findAll({
    where: categoryWhere,
    order: [['createdAt', 'DESC']],
    include: [{ model: db.Vendor }],
  });
  const vendorsPlain = vendors.map((v) => v.get({ plain: true }));

  return (
    <main className="page-shell">
      {/* Header */}
      <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="page-title">Categorías</CardTitle>
              <p className="page-subtitle">{categories.length} categoría{categories.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href="/admin"><Button variant="ghost" size="sm">← Volver</Button></Link>
          </div>
          <form method="get" className="flex items-end gap-2 flex-wrap pt-2">
            <div className="grid gap-1">
              <label className="text-xs text-[var(--muted)] font-medium">Filtrar por tienda</label>
              <select name="vendorId" defaultValue={vendorId} className="select text-sm py-2 min-w-[200px]">
                <option value="">Todas las tiendas</option>
                {vendorsPlain.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="secondary-button text-sm py-2 px-4">Filtrar</button>
          </form>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Crear categoría */}
        <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Agregar categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateCategoryForm vendors={vendorsPlain} />
          </CardContent>
        </Card>

        {/* Lista de categorías */}
        <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Categorías existentes</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-4">No hay categorías.</p>
            ) : (
              <ul className="list-none p-0 m-0 grid gap-2">
                {categories.map((category) => (
                  <li
                    key={category.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--text)] m-0">{category.name}</p>
                      <p className="text-xs text-[var(--muted)] m-0">/{category.slug} · {category.Vendor?.name || 'N/A'}</p>
                    </div>
                    <Link href={`/admin/categories/${category.id}`}>
                      <Button variant="outline" size="sm">Editar</Button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
