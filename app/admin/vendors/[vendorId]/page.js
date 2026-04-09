import Link from 'next/link';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import EditVendorForm from '../EditVendorForm';

export default async function AdminVendorDetailsPage({ params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>No autorizado</h1>
        <p>Necesitas iniciar sesión como admin.</p>
        <Link href="/login">Ir a login</Link>
      </main>
    );
  }

  const resolvedParams = await params;
  const vendor = await db.Vendor.findByPk(resolvedParams.vendorId, { include: [{ model: db.User }] });
  if (!vendor) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Vendedor no encontrado</h1>
        <Link href="/admin/vendors">Volver a vendedores</Link>
      </main>
    );
  }

  const vendorData = vendor.get({ plain: true });

  return (
    <main className="page-shell">
      <section className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Editar tienda</h1>
            <p className="page-subtitle">{vendorData.name}</p>
          </div>
          <Link href="/admin" className="secondary-button">Volver</Link>
        </div>
        <div className="cta-row" style={{ marginTop: '1.25rem' }}>
          <Link href={`/admin/vendors/${vendorData.id}/products`} className="secondary-button">Productos</Link>
          <Link href={`/admin/vendors/${vendorData.id}/categories`} className="secondary-button">Categorías</Link>
        </div>
      </section>

      <section className="page-card">
        <EditVendorForm vendor={vendorData} />
      </section>
    </main>
  );
}
