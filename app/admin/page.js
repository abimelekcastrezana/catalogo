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
      <main className="page-shell">
        <section className="page-card">
          <h1 className="page-title">No autorizado</h1>
          <p className="page-subtitle">Necesitas iniciar sesión como admin.</p>
          <Link href="/login" className="primary-button">Ir a login</Link>
        </section>
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
    <main className="page-shell">
      <section className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Panel de administración</h1>
            <p className="page-subtitle">{session.user.email}</p>
          </div>
          <Link href="/logout" className="secondary-button">Cerrar sesión</Link>
        </div>
        <CreateVendorWidget />
      </section>

      <section className="page-card">
        <h2 style={{ margin: '0 0 1rem' }}>Tiendas</h2>
        <form method="get" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: '220px' }}>
            Filtrar por slug
            <input name="slug" defaultValue={searchSlug} placeholder="Buscar slug" className="input" />
          </label>
          <button type="submit" className="secondary-button">Filtrar</button>
        </form>
        <div style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
        }}>
          {visibleVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </section>
    </main>
  );
}
