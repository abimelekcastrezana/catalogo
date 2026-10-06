import { getUserSession } from '../../../lib/auth/getSession';
import db from '../../../db/index.js';
import ConfigForm from './ConfigForm';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ArrowLeft, MapPin } from 'lucide-react';

export default async function DashboardConfigPage() {
  const session = await getUserSession();
  if (!session) {
    return (
      <main className="page-shell">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-[var(--text)]">Sesión requerida.</p>
            <Link href="/login"><Button>Iniciar sesión</Button></Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const vendorModel = await db.Vendor.findByPk(session.user.vendorId);
  if (!vendorModel) {
    return (
      <main className="page-shell">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="pt-6 text-center">
            <p className="text-[var(--text)]">Tienda no encontrada.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const vendor = vendorModel.get({ plain: true });
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const publicUrl = `${baseUrl}/${vendor.slug}`;
  const tags = [vendor.tag1, vendor.tag2].filter(Boolean);

  return (
    <main className="page-shell">
      {/* Header con resumen de la tienda */}
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="page-title">Configuración</CardTitle>
              <p className="page-subtitle">Personaliza el perfil público de tu tienda.</p>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm"><ArrowLeft aria-hidden="true" /> Volver</Button>
            </Link>
          </div>

          {/* Info rápida de la tienda */}
          <div className="flex flex-wrap gap-4 pt-3 text-sm text-[var(--muted)]">
            <span>
              <span className="font-medium text-[var(--text)]">{vendor.name}</span>
            </span>
            <a href={publicUrl} target="_blank" rel="noreferrer"
              className="text-[var(--accent-text)] hover:underline">
              /{vendor.slug}
            </a>
            {vendor.state && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden="true" /> {vendor.city ? `${vendor.city}, ` : ''}{vendor.state}</span>
            )}
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Formulario */}
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardContent className="pt-6">
          <ConfigForm vendor={vendor} />
        </CardContent>
      </Card>
    </main>
  );
}
