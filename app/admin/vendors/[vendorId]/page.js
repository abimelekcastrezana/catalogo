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
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Editar tienda</h1>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href={`/admin/vendors/${vendorData.id}/products`} style={{ padding: '0.65rem 1rem', border: '1px solid #0645ad', borderRadius: '8px', textDecoration: 'none', color: '#0645ad' }}>
          Productos
        </Link>
        <Link href={`/admin/vendors/${vendorData.id}/categories`} style={{ padding: '0.65rem 1rem', border: '1px solid #0645ad', borderRadius: '8px', textDecoration: 'none', color: '#0645ad' }}>
          Categorías
        </Link>
      </div>
      <EditVendorForm vendor={vendorData} />
      <p style={{ marginTop: '1rem' }}><Link href="/admin">Volver al admin</Link></p>
    </main>
  );
}
