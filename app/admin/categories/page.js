import Link from 'next/link';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import CreateCategoryForm from './CreateCategoryForm';

export default async function AdminCategoriesPage({ searchParams }) {
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

  const resolvedSearchParams = await searchParams;
  const vendorId = resolvedSearchParams?.vendorId || '';
  const vendors = await db.Vendor.findAll({ order: [['name', 'ASC']] });
  const categoryWhere = vendorId ? { vendorId } : {};
  const categories = await db.Category.findAll({ where: categoryWhere, order: [['createdAt', 'DESC']], include: [{ model: db.Vendor }] });

  return (
    <main className="page-shell">
      <section className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Admin - Categorías</h1>
          </div>
          <Link href="/admin" className="secondary-button">Volver</Link>
        </div>
        <form method="get" style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="form-field" style={{ flex: '1', minWidth: '200px' }}>
            <label>Filtrar por vendedor</label>
            <select name="vendorId" defaultValue={vendorId} className="select">
              <option value="">Todas</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="secondary-button">Aplicar filtro</button>
        </form>
      </section>

      <section className="page-card">
        <h2 style={{ marginTop: 0 }}>Agregar categoría</h2>
        <CreateCategoryForm vendors={vendors.map((v) => v.get({ plain: true }))} />
      </section>

      <section className="page-card">
        <h2 style={{ marginTop: 0 }}>Categorías existentes</h2>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '1rem' }}>
          {categories.map((category) => (
            <li key={category.id} style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '1rem', background: 'var(--card)' }}>
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <strong style={{ display: 'block', fontSize: '1rem' }}>{category.name}</strong>
                <span className="text-small">/{category.slug}</span>
                <span className="text-small">Vendedor: {category.Vendor?.name || 'N/A'}</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <Link href={`/admin/categories/${category.id}`} className="secondary-button" style={{ padding: '0.4rem 0.85rem', fontSize: '0.9rem' }}>Editar</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
