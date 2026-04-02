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
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Dashboard - Categorías</h1>
      <ul>
        {categories.map((c) => (
          <li key={c.id}>{c.name} ({c.slug})</li>
        ))}
      </ul>
      <p>Agregar categoría:</p>
      <AddCategoryForm vendorId={session.user.vendorId} />
      <p style={{ marginTop: '1rem' }}><Link href="/dashboard">Volver</Link></p>
    </main>
  );
}
