import { getUserSession } from '../../../lib/auth/getSession';
import db from '../../../db/index.js';
import ConfigForm from './ConfigForm';
import Link from 'next/link';

export default async function DashboardConfigPage() {
  const session = await getUserSession();
  if (!session) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>No autorizado</h1>
        <p>Inicia sesión para administrar tu tienda.</p>
        <Link href="/login">Iniciar sesión</Link>
      </main>
    );
  }

  const vendorModel = await db.Vendor.findByPk(session.user.vendorId);
  if (!vendorModel) {
    return (
      <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Vendor no encontrado</h1>
      </main>
    );
  }

  const vendor = vendorModel.get({ plain: true });

  return (
    <main className="page-shell">
      <section className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Dashboard - Configuración</h1>
            <p className="page-subtitle">Personaliza tu tienda con colores y contacto directo.</p>
          </div>
          <Link href="/dashboard" className="secondary-button">Volver</Link>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.75rem' }}>
          <p style={{ margin: 0 }}>Vendor actual: {vendor.name}</p>
          <p style={{ margin: 0 }}>Slug público: {vendor.slug}</p>
          <p style={{ margin: 0 }}>Slogan actual: {vendor.slogan || 'No definido'}</p>
          <p style={{ margin: 0 }}>URL pública: {process.env.NEXTAUTH_URL || 'http://localhost:3000'}/{vendor.slug}</p>
        </div>
      </section>

      <section className="page-card">
        <ConfigForm vendor={vendor} />
      </section>
    </main>
  );
}
