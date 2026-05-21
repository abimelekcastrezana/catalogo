import Link from 'next/link';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import EditVendorForm from '../EditVendorForm';
import BackButton from '@/app/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';

export default async function AdminVendorDetailsPage({ params }) {
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
  const vendor = await db.Vendor.findByPk(resolvedParams.vendorId, { include: [{ model: db.User }] });
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

  const vendorData = vendor.get({ plain: true });

  return (
    <main className="page-shell">
      {/* Header */}
      <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="page-title">Editar tienda</CardTitle>
              <p className="text-sm text-[var(--muted)] mt-1">{vendorData.name} · /{vendorData.slug}</p>
            </div>
            <BackButton fallback="/admin" />
          </div>
          <div className="flex gap-2 flex-wrap pt-2">
            <Link href={`/admin/vendors/${vendorData.id}/products`}>
              <Button variant="outline" size="sm">Productos</Button>
            </Link>
            <Link href={`/admin/vendors/${vendorData.id}/categories`}>
              <Button variant="outline" size="sm">Categorías</Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Formulario */}
      <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
        <CardContent className="pt-6">
          <EditVendorForm vendor={vendorData} />
        </CardContent>
      </Card>
    </main>
  );
}
