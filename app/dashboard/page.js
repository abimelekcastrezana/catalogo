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

  const vendor = await db.Vendor.findByPk(session.user.vendorId);
  const publicUrl = vendor ? `https://tu-dominio.com/${vendor.slug}` : 'No definido';

  return (
    <main style={{ padding: "1.5rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Dashboard</h1>
      <p>Usuario: {session.user?.email}</p>
      <p>VendorId: {session.user?.vendorId}</p>
      <p>Vendor slug: {vendor?.slug || 'N/A'}</p>
      <p>URL pública: {publicUrl}</p>
      <ul>
        <li><Link href="/dashboard/categories">Editar categorías</Link></li>
        <li><Link href="/dashboard/products">Editar productos</Link></li>
        <li><Link href="/dashboard/config">Config de tienda</Link></li>
      </ul>
      <Link href="/">Volver a inicio</Link>
      <br />
      <Link href="/logout">Cerrar sesión</Link>
    </main>
  );
}
