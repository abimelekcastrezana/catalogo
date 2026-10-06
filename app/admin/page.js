import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import Link from 'next/link';
import CreateVendorWidget from './vendors/CreateVendorWidget';
import VendorCard from './vendors/VendorCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default async function AdminPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const session = await getUserSession();

  if (!session || session.user.role !== 'admin') {
    return (
      <main className="page-shell">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-[var(--text)]">Necesitas iniciar sesión como admin.</p>
            <Link href="/login" className="primary-button inline-block">Ir a login</Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const searchSlug = (resolvedSearchParams?.slug || '').trim().toLowerCase();
  const vendors = await db.Vendor.findAll({
    include: [{ model: db.User }],
    order: [['createdAt', 'DESC']],
  });
  const visibleVendors = vendors
    .map((v) => v.get({ plain: true }))
    .filter((v) => v.slug !== 'gatunoide')
    .filter((v) => !searchSlug || v.slug.toLowerCase().includes(searchSlug) || v.name.toLowerCase().includes(searchSlug));

  return (
    <main className="page-shell">
      {/* Header del panel */}
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="page-title">Panel de administración</CardTitle>
              <p className="text-sm text-[var(--muted)] mt-1">{session.user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CreateVendorWidget />
        </CardContent>
      </Card>

      {/* Lista de tiendas */}
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-xl">
              Tiendas
              <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                ({visibleVendors.length})
              </span>
            </CardTitle>
            <form method="get" className="flex items-end gap-2">
              <input
                name="slug"
                defaultValue={searchSlug}
                placeholder="Buscar por nombre o slug"
                className="input text-sm py-2 min-w-[200px]"
              />
              <button type="submit" className="secondary-button text-sm py-2 px-4">
                Filtrar
              </button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {visibleVendors.length === 0 ? (
            <p className="text-center text-[var(--muted)] py-8">No hay tiendas que coincidan.</p>
          ) : (
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))]">
              {visibleVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
