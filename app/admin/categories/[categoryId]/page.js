import Link from 'next/link';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import EditCategoryForm from '../EditCategoryForm';

export default async function AdminCategoryEditPage({ params }) {
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

  const category = await db.Category.findByPk(params.categoryId, { include: [{ model: db.Vendor }] });
  const vendors = await db.Vendor.findAll({ order: [['name', 'ASC']] });

  if (!category) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Categoría no encontrada</h1>
        <Link href="/admin/categories">Volver a categorías</Link>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="page-title">Editar categoría</h1>
          <Link href="/admin/categories" className="secondary-button">Volver</Link>
        </div>
      </section>
      <section className="page-card">
        <EditCategoryForm category={category.get({ plain: true })} vendors={vendors.map((v) => v.get({ plain: true }))} />
      </section>
    </main>
  );
}
