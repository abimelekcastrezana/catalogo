import { getUserSession } from '../../../lib/auth/getSession';
import db from '../../../db/index.js';
import Link from 'next/link';
import AddCategoryForm from './AddCategoryForm';

export default async function DashboardCategoriesPage() {
  const session = await getUserSession();
  if (!session) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>No autorizado</h1>
        <Link href="/login">Iniciar sesión</Link>
      </main>
    );
  }

  const categories = await db.Category.findAll({ where: { vendorId: session.user.vendorId }, order: [['createdAt', 'DESC']] });

  return (
    <main className="page-shell">
      <section className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Dashboard - Categorías</h1>
            <p className="page-subtitle">Administra las categorías de tu tienda desde un panel limpio.</p>
          </div>
          <Link href="/dashboard" className="secondary-button">Volver</Link>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <ul style={{ display: 'grid', gap: '0.75rem', paddingLeft: '1.25rem', margin: 0 }}>
            {categories.map((c) => (
              <li key={c.id} style={{ color: 'var(--text)' }}>{c.name} ({c.slug})</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="page-card">
        <h2 style={{ marginTop: 0 }}>Agregar categoría</h2>
        <AddCategoryForm vendorId={session.user.vendorId} />
      </section>
    </main>
  );
}
