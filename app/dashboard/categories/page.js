import { getUserSession } from '../../../lib/auth/getSession';
import db from '../../../db/index.js';
import Link from 'next/link';
import AddCategoryForm from './AddCategoryForm';
import SortableCategoryList from '../../components/SortableCategoryList';

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

  const categories = await db.Category.findAll({ where: { vendorId: session.user.vendorId }, order: [['position', 'ASC'], ['name', 'ASC']] });

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
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Ordenar categorías</h2>
          <SortableCategoryList
            categories={categories.map((c) => c.get({ plain: true }))}
            reorderEndpoint={`/api/vendors/${session.user.vendorId}/categories/reorder`}
          />
        </div>
      </section>

      <section className="page-card">
        <h2 style={{ marginTop: 0 }}>Agregar categoría</h2>
        <AddCategoryForm vendorId={session.user.vendorId} />
      </section>
    </main>
  );
}
