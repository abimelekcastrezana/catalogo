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
  const generalWhatsappPhone = (process.env.CONTACT_WHATSAPP || '+524622222741').replace(/[^0-9+]/g, '').replace(/^\+/, '');

  return (
    <main style={{ minHeight: '100vh', background: '#f4f7fb', fontFamily: 'Arial, sans-serif', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Busca tiendas</h1>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/login" style={{ color: '#0645ad', textDecoration: 'none', fontWeight: 600 }}>Iniciar sesión</Link>
          <Link href="/register" style={{ color: '#0645ad', textDecoration: 'none', fontWeight: 600 }}>Registrarse</Link>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <a
          href={`https://wa.me/${generalWhatsappPhone}?text=${encodeURIComponent('Hola, quiero más información sobre el catálogo')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.95rem 1.25rem', background: '#25D366', color: '#fff', borderRadius: '999px', textDecoration: 'none', fontWeight: 600 }}
        >
          WhatsApp de catálogo general
        </a>
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

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 280px))', justifyContent: 'center', margin: '0 auto' }}>
        {vendors.map((vendor) => {
          const logoPath = vendor.logoUrl
            ? vendor.logoUrl.startsWith('/')
              ? `/api/uploads${vendor.logoUrl.replace(/^\/uploads\/?/, '/')}`
              : vendor.logoUrl
            : null;
          return (
            <article key={vendor.id} style={{ border: '1px solid #ddd', borderRadius: '16px', padding: '0', background: '#fff', boxShadow: '0 1px 10px rgba(0,0,0,0.06)', overflow: 'hidden', width: '100%', maxWidth: '320px' }}>
              <div style={{ width: '100%', aspectRatio: '1 / 1', minHeight: '220px', background: '#f8f8f8' }}>
                {logoPath ? (
                  <img src={logoPath} alt={`${vendor.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '0.95rem' }}>
                    Sin logo
                  </div>
                )}
              </div>
              <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#555', fontWeight: 600, marginBottom: '0.35rem' }}>Tienda</div>
                  <h2 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem' }}>{vendor.name}</h2>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.95rem' }}>{vendor.slogan || 'Sin descripción'}</p>
                  <p style={{ margin: '0.65rem 0 0', color: '#555', fontSize: '0.9rem' }}>/ {vendor.slug}</p>
                </div>
                {(vendor.tag1 || vendor.tag2) && (
                  <p style={{ margin: 0, color: '#333', fontSize: '0.92rem' }}>
                    Tags: {[vendor.tag1, vendor.tag2].filter(Boolean).join(', ')}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link href={`/${vendor.slug}`} style={{ padding: '0.6rem 0.95rem', border: '1px solid #0645ad', borderRadius: '999px', color: '#0645ad', textDecoration: 'none', fontSize: '0.92rem' }}>
                    Ver catálogo
                  </Link>
                </div>
                <p style={{ margin: 0, color: '#777', fontSize: '0.88rem' }}>URL pública: {baseUrl}/{vendor.slug}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
        <a
          href={`https://wa.me/${generalWhatsappPhone}?text=${encodeURIComponent('Hola, quiero más información sobre el catálogo')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.95rem 1.25rem', background: '#25D366', color: '#fff', borderRadius: '999px', textDecoration: 'none', fontWeight: 600 }}
        >
          WhatsApp de catálogo general
        </a>
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
      </div>
    </main>
  );
}

