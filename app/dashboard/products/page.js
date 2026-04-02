import { getUserSession } from '../../../lib/auth/getSession';
import db from '../../../db/index.js';
import Link from 'next/link';
import AddProductForm from './AddProductForm';

export default async function DashboardProductsPage() {
  const session = await getUserSession();
  if (!session) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>No autorizado</h1>
        <Link href="/login">Iniciar sesión</Link>
      </main>
    );
  }

  const products = await db.Product.findAll({ where: { vendorId: session.user.vendorId }, order: [['createdAt', 'DESC']] });

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Dashboard - Productos</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>{p.name} ({p.sku})</li>
        ))}
      </ul>
      <p>Agregar producto:</p>
      <AddProductForm vendorId={session.user.vendorId} />
      <p style={{ marginTop: '1rem' }}><Link href="/dashboard">Volver</Link></p>
    </main>
  );
}
