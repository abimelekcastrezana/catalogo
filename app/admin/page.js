import Link from 'next/link';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import CreateVendorWidget from './vendors/CreateVendorWidget';
import VendorCard from './vendors/VendorCard';

export default async function AdminPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
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

  const searchSlug = (resolvedSearchParams?.slug || '').trim().toLowerCase();
  const vendors = await db.Vendor.findAll({ include: [{ model: db.User }], order: [['createdAt', 'DESC']] });
  const visibleVendors = vendors
    .map((vendor) => vendor.get({ plain: true }))
    .filter((vendor) => vendor.slug !== 'gatunoide')
    .filter((vendor) => !searchSlug || vendor.slug.toLowerCase().includes(searchSlug));

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Panel de administración</h1>
      <p>Usuario admin: {session.user.email}</p>

      <CreateVendorWidget />

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Vendedores / Tiendas</h2>
        <form method="get" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            Filtrar por slug
            <input name="slug" defaultValue={searchSlug} placeholder="Buscar slug" style={{ padding: '0.5rem', minWidth: '220px' }} />
          </label>
          <button type="submit" style={{ padding: '0.6rem 1rem' }}>Filtrar</button>
        </form>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {visibleVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </section>


      <p style={{ marginTop: '1rem' }}><Link href="/logout">Cerrar sesión</Link></p>
    </main>
  );
}
