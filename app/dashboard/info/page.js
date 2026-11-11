import Link from 'next/link';
import { getUserSession } from '../../../lib/auth/getSession';
import db from '../../../db/index.js';
import InfoForm from './InfoForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardInfoPage() {
  const session = await getUserSession();
  if (!session?.user?.vendorId) {
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
  if (!vendorModel) return null;
  const vendor = vendorModel.get({ plain: true });

  return (
    <main className="page-shell">
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
             
              <CardTitle className="page-title">Info del negocio</CardTitle>
              <Link href="/dashboard/info"><Button variant="outline">Info del negocio</Button></Link>
              <p className="page-subtitle">Lo que tus clientes verán en la pestaña "Info" de tu tienda.</p>
            </div>
            <Link href="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft aria-hidden="true" /> Volver</Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          <InfoForm vendor={vendor} />
        </CardContent>
      </Card>
    </main>
  );
}