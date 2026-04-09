import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import db from "../../db/index.js";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main style={{ padding: "1.5rem", fontFamily: "Arial, sans-serif" }}>
        <h1>No autorizado</h1>
        <p>Necesitas iniciar sesión primero.</p>
        <Link href="/login">Ir a login</Link>
      </main>
    );
  }

  if (session.user.role === 'admin') {
    return (
      <main className="page-shell">
        <section className="page-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title">Panel de administración</h1>
              <p className="page-subtitle">Gestiona vendedores y categorías de forma segura.</p>
            </div>
            <div className="hero-actions">
              <Link href="/logout" className="secondary-button">Cerrar sesión</Link>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ margin: '0.5rem 0' }}>Usuario: {session.user?.email}</p>
            <ul style={{ margin: '1rem 0', paddingLeft: '1.25rem', color: 'var(--text)' }}>
              <li><Link href="/admin/vendors">Gestionar vendedores / tiendas</Link></li>
              <li><Link href="/admin/categories">Gestionar categorías</Link></li>
            </ul>
          </div>
        </section>
      </main>
    );
  }

  const vendor = await db.Vendor.findByPk(session.user.vendorId);
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const publicUrl = vendor ? `${baseUrl}/${vendor.slug}` : 'No definido';

  return (
    <main className="page-shell">
      <section className="page-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Accede a las herramientas para administrar tu tienda.</p>
          </div>
          <div className="hero-actions">
            <Link href="/logout" className="secondary-button">Cerrar sesión</Link>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.85rem' }}>
          <p style={{ margin: 0 }}>Usuario: {session.user?.email}</p>
          <p style={{ margin: 0 }}>VendorId: {session.user?.vendorId}</p>
          <p style={{ margin: 0 }}>Vendor slug: {vendor?.slug || 'N/A'}</p>
          <p style={{ margin: 0 }}>URL pública: {publicUrl}</p>
        </div>

        <div className="cta-row" style={{ marginTop: '1.25rem' }}>
          <Link href="/dashboard/categories" className="secondary-button">Editar categorías</Link>
          <Link href="/dashboard/products" className="secondary-button">Editar productos</Link>
          <Link href="/dashboard/config" className="secondary-button">Config de tienda</Link>
        </div>
      </section>
    </main>
  );
}
