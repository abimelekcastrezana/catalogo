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
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Admin - Categorías</h1>
      <form method="get" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          Filtrar por vendedor
          <select name="vendorId" defaultValue={vendorId} style={{ padding: '0.5rem', minWidth: '220px' }}>
            <option value="">Todas</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
            ))}
          </select>
        </label>
        <button type="submit" style={{ padding: '0.6rem 1rem' }}>Aplicar filtro</button>
      </form>
      <p>Crear nueva categoría:</p>
      <CreateCategoryForm vendors={vendors.map((v) => v.get({ plain: true }))} />

      <section style={{ marginTop: '2rem' }}>
        <h2>Categorías existentes</h2>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {categories.map((category) => (
            <li key={category.id} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '0.85rem', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1rem' }}>{category.name}</strong>
                    <span style={{ color: '#555', fontSize: '0.85rem' }}>/{category.slug}</span>
                  </div>
                </div>
                <div style={{ color: '#555', fontSize: '0.85rem' }}>Vendedor: {category.Vendor?.name || 'N/A'}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link href={`/admin/categories/${category.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', border: '1px solid #ccc', borderRadius: '999px', fontSize: '0.9rem' }}>
                    Editar <span style={{ fontSize: '1.1rem' }}>›</span>
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p style={{ marginTop: '1rem' }}><Link href="/admin">Volver al panel admin</Link></p>
    </main>
  );
}
