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
    <main className="page-shell">
      <section className="page-card">
        <form method="get" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: '1', minWidth: '240px' }}>
            Buscar por tienda, slug o tag
            <input
              name="search"
              defaultValue={search}
              placeholder="Ej. belleza, uñas, spa"
              className="input"
              style={{ width: '100%' }}
            />
          </label>
          <button type="submit" className="secondary-button">Buscar</button>
        </form>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <p style={{ margin: 0, color: 'var(--muted)' }}>Mostrando {vendors.length} de {totalVendors} tiendas</p>
            <p style={{ margin: 0, color: 'var(--muted)' }}>Página {pageToFetch} de {totalPages}</p>
          </div>
        </div>
      </section>

      <section className="page-card">
        <div className="grid-cards">
          {vendors.map((vendor) => {
            const logoPath = vendor.logoUrl
              ? vendor.logoUrl.startsWith('/')
                ? `/api/uploads${vendor.logoUrl.replace(/^\/uploads\/?/, '/')}`
                : vendor.logoUrl
              : null;
            return (
              <article key={vendor.id} className="card">
                <div className="card-hero">
                  {logoPath ? (
                    <img src={logoPath} alt={`${vendor.name} logo`} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.95rem' }}>
                      Sin logo
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.35rem' }}>Tienda</div>
                    <h2>{vendor.name}</h2>
                    <p>{vendor.slogan || 'Sin descripción'}</p>
                    <p style={{ margin: '0.65rem 0 0', color: 'var(--muted)', fontSize: '0.92rem' }}>/ {vendor.slug}</p>
                  </div>
                  {(vendor.tag1 || vendor.tag2) && (
                    <p className="text-small">
                      Tags: {[vendor.tag1, vendor.tag2].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <div className="form-actions card-footer" style={{ justifyContent: 'flex-start' }}>
                    <Link href={`/${vendor.slug}`} className="secondary-button" style={{ padding: '0.65rem 1rem', fontSize: '0.92rem' }}>
                      Ver catálogo
                    </Link>
                  </div>
                  <p className="text-small">URL pública: {baseUrl}/{vendor.slug}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="pagination-row" style={{ marginTop: '1.5rem' }}>
        {pageToFetch > 1 && (
          <Link href={`/?search=${encodeURIComponent(search)}&page=${pageToFetch - 1}`} className="secondary-button" style={{ padding: '0.6rem 1rem' }}>
            Anterior
          </Link>
        )}
        <span> Página {pageToFetch} de {totalPages} </span>
        {pageToFetch < totalPages && (
          <Link href={`/?search=${encodeURIComponent(search)}&page=${pageToFetch + 1}`} className="secondary-button" style={{ padding: '0.6rem 1rem' }}>
            Siguiente
          </Link>
        )}
      </div>
    </main>
  );
}

