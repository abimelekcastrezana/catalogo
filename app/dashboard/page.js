import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import db from "../../db/index.js";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import OnlineToggle from "./OnlineToggle";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Card className="w-full max-w-sm border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-[var(--text)]">Necesitas iniciar sesión primero.</p>
            <Link href="/login"><Button className="w-full">Ir a login</Button></Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (session.user.role === 'admin') {
    return (
      <main className="page-shell">
        <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
          <CardHeader>
            <CardTitle className="page-title">Panel de administración</CardTitle>
            <p className="page-subtitle">Gestiona vendedores y categorías de forma segura.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-[var(--muted)]">Usuario: {session.user?.email}</p>
            <div className="flex gap-3 flex-wrap mt-4">
              <Link href="/admin/vendors"><Button variant="outline">Gestionar tiendas</Button></Link>
              <Link href="/admin/categories"><Button variant="outline">Gestionar categorías</Button></Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const vendor = await db.Vendor.findByPk(session.user.vendorId);
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const publicUrl = vendor ? `${baseUrl}/${vendor.slug}` : 'No definido';

  return (
    <main className="page-shell">
      <Card className="border-[var(--border)] bg-[var(--surface)] shadow-card">
        <CardHeader>
          <CardTitle className="page-title">Dashboard</CardTitle>
          <p className="page-subtitle">Accede a las herramientas para administrar tu tienda.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-1.5 text-sm">
            <p className="text-[var(--text)]">Usuario: <span className="font-medium">{session.user?.email}</span></p>
            <p className="text-[var(--text)]">Vendor: <span className="font-medium">{vendor?.slug || 'N/A'}</span></p>
            <p className="text-[var(--text)]">URL pública: <a href={publicUrl} target="_blank" rel="noreferrer" className="text-[var(--accent-text)] hover:underline">{publicUrl}</a></p>
          </div>
          {vendor && (
            <div className="pt-1">
              <OnlineToggle
                vendorId={vendor.id}
                initialIsOnline={vendor.isOnline ?? true}
                vendorData={{
                  name: vendor.name,
                  slug: vendor.slug,
                  whatsappPhone: vendor.whatsappPhone,
                  slogan: vendor.slogan || '',
                  state: vendor.state || '',
                  city: vendor.city || '',
                }}
              />
            </div>
          )}
          <div className="flex gap-3 flex-wrap pt-2">
            <Link href="/dashboard/categories"><Button variant="outline">Categorías</Button></Link>
            <Link href="/dashboard/products"><Button variant="outline">Productos</Button></Link>
            <Link href="/dashboard/config"><Button variant="outline">Configuración</Button></Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
