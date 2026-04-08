import Link from 'next/link';
import db from '@/db/index.js';
import { Op } from 'sequelize';

const PAGE_SIZE = 10;

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const search = (resolvedSearchParams?.search || '').trim().toLowerCase();
  const rawPage = parseInt(resolvedSearchParams?.page ?? '1', 10);
  const currentPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const where = { isActive: true };
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { slug: { [Op.iLike]: `%${search}%` } },
      { tag1: { [Op.iLike]: `%${search}%` } },
      { tag2: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const totalVendors = await db.Vendor.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalVendors / PAGE_SIZE));
  const pageToFetch = currentPage > totalPages ? totalPages : currentPage;
  const offset = (pageToFetch - 1) * PAGE_SIZE;

  const vendorModels = await db.Vendor.findAll({ where, order: [['createdAt', 'DESC']], limit: PAGE_SIZE, offset });
  const vendors = vendorModels.map((vendor) => vendor.get({ plain: true })).filter((vendor) => vendor.slug !== 'gatunoide');

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Busca tiendas</h1>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/login" style={{ color: '#0645ad', textDecoration: 'none', fontWeight: 600 }}>Iniciar sesión</Link>
          <Link href="/register" style={{ color: '#0645ad', textDecoration: 'none', fontWeight: 600 }}>Registrarse</Link>
        </div>
      </div>
      <form method="get" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <input
          name="search"
          defaultValue={search}
          placeholder="Buscar por nombre, slug o tag"
          style={{ padding: '0.75rem', minWidth: '280px', flex: '1' }}
        />
        <button type="submit" style={{ padding: '0.75rem 1rem' }}>Buscar</button>
      </form>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {vendors.map((vendor) => {
          const logoPath = vendor.logoUrl
            ? vendor.logoUrl.startsWith('/')
              ? `/api/uploads${vendor.logoUrl.replace(/^\/uploads\/?/, '/')}`
              : vendor.logoUrl
            : null;
          return (
            <article key={vendor.id} style={{ border: '1px solid #ddd', borderRadius: '16px', padding: '0', background: '#fff', boxShadow: '0 1px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ width: '100%', aspectRatio: '1 / 1', minHeight: '220px', background: '#f8f8f8' }}>
                {logoPath ? (
                  <img src={logoPath} alt={`${vendor.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '0.95rem' }}>
                    Sin logo
                  </div>
                )}
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#555', fontWeight: 600, marginBottom: '0.5rem' }}>Tienda</div>
                  <h2 style={{ margin: '0 0 0.5rem 0' }}>{vendor.name}</h2>
                  <p style={{ margin: 0, color: '#555' }}>{vendor.slogan || 'Sin descripción'}</p>
                  <p style={{ margin: '0.75rem 0 0', color: '#555' }}>/ {vendor.slug}</p>
                </div>
                {(vendor.tag1 || vendor.tag2) && (
                  <p style={{ margin: 0, color: '#333' }}>
                    Tags: {[vendor.tag1, vendor.tag2].filter(Boolean).join(', ')}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link href={`/${vendor.slug}`} style={{ padding: '0.65rem 1rem', border: '1px solid #0645ad', borderRadius: '999px', color: '#0645ad', textDecoration: 'none' }}>
                    Ver catálogo
                  </Link>
                  <span style={{ color: '#777', fontSize: '0.95rem' }}>{baseUrl}/{vendor.slug}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {pageToFetch > 1 && (
          <Link href={`/?search=${encodeURIComponent(search)}&page=${pageToFetch - 1}`} style={{ padding: '0.6rem 1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            Anterior
          </Link>
        )}
        <span>Página {pageToFetch} de {totalPages}</span>
        {pageToFetch < totalPages && (
          <Link href={`/?search=${encodeURIComponent(search)}&page=${pageToFetch + 1}`} style={{ padding: '0.6rem 1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            Siguiente
          </Link>
        )}
      </div>
    </main>
  );
}

