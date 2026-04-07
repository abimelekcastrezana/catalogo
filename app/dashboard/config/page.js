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
    <main style={{ padding: '1.5rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Dashboard - Configuración</h1>
      <p>Vendor actual: {vendor.name}</p>
      <p>Slug público: {vendor.slug}</p>
      <p>Slogan actual: {vendor.slogan || 'No definido'}</p>
      <p>URL pública: https://tu-dominio.com/{vendor.slug}</p>
      <p>API pública: /api/vendors/public/{vendor.slug}</p>
      <ConfigForm vendor={vendor} />
      <p style={{ marginTop: '1rem' }}><Link href="/dashboard">Volver</Link></p>
    </main>
  );
}
