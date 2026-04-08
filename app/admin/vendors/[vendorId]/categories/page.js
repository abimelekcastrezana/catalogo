import Link from 'next/link';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import AddVendorCategoryForm from '../AddVendorCategoryForm';
import BackButton from '@/app/components/BackButton';

export default async function AdminVendorCategoriesPage({ params }) {
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

  const resolvedParams = await params;
  const vendorId = resolvedParams.vendorId;
  const vendor = await db.Vendor.findByPk(vendorId);
  if (!vendor) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Tienda no encontrada</h1>
        <Link href="/admin">Volver al admin</Link>
      </main>
    );
  }

  const categories = await db.Category.findAll({ where: { vendorId }, order: [['createdAt', 'DESC']] });

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Categorías de {vendor.name}</h1>
          <p style={{ margin: '0.25rem 0 0' }}>Edita las categorías del vendedor desde aquí.</p>
        </div>
        <BackButton />
      </div>

      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <AddVendorCategoryForm vendorId={vendorId} />
        <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '0.85rem', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ marginTop: 0 }}>Categorías existentes</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
            {categories.map((category) => (
              <li key={category.id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <strong>{category.name}</strong>
                    <div style={{ color: '#555', fontSize: '0.9rem' }}>/{category.slug}</div>
                  </div>
                  <Link href={`/admin/categories/${category.id}`} style={{ textDecoration: 'none', color: '#0645ad' }}>Editar</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
