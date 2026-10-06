import { getUserSession } from '../../../lib/auth/getSession';
import db from '../../../db/index.js';
import Link from 'next/link';
import AddProductCard from './AddProductCard';
import ProductFilter from './ProductFilter';
import ProductRow from './ProductRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft, ArrowRight, Package } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

async function getCategories(vendorId) {
  return db.Category.findAll({ where: { vendorId }, order: [['name', 'ASC']] });
}

export default async function DashboardProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const categoryId = resolvedSearchParams?.categoryId || '';
  const rawPage = parseInt(resolvedSearchParams?.page ?? '1', 10);
  const currentPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

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

  const { vendorId } = session.user;
  const productWhere = { vendorId };
  if (categoryId) productWhere.categoryId = categoryId;

  const totalProducts = await db.Product.count({ where: productWhere });
  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));
  const pageToFetch = Math.min(currentPage, totalPages);
  const offset = (pageToFetch - 1) * ITEMS_PER_PAGE;

  const productModels = await db.Product.findAll({
    where: productWhere,
    order: [['position', 'ASC'], ['createdAt', 'DESC']],
    include: [
      { model: db.ProductImage, order: [['position', 'ASC']] },
      { model: db.Category },
      { model: db.ProductVariant, order: [['position', 'ASC']] },
    ],
    limit: ITEMS_PER_PAGE,
    offset,
  });
  const products = productModels.map((p) => p.get({ plain: true }));
  const categoryModels = await getCategories(vendorId);
  const categories = categoryModels.map((c) => c.get({ plain: true }));

  const buildPageLink = (page) => {
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId);
    params.set('page', String(page));
    return `/dashboard/products?${params.toString()}`;
  };

  return (
    <main className="page-shell">
      {/* Header */}
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="page-title">Productos</CardTitle>
              <p className="page-subtitle">
                {totalProducts} producto{totalProducts !== 1 ? 's' : ''}
                {categoryId ? ' en esta categoría' : ' en total'}
              </p>
            </div>
            <ProductFilter categories={categories} />
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            <AddProductCard vendorId={vendorId} categories={categories} />
            <Link href="/dashboard/products/reorder">
              <Button variant="outline" size="sm">Reordenar</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm"><ArrowLeft aria-hidden="true" /> Volver</Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Grid de productos */}
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardContent className="pt-6">
          {products.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Package className="mx-auto h-10 w-10 text-[var(--muted)]" strokeWidth={1.5} aria-hidden="true" />
              <p className="text-[var(--muted)]">No hay productos aún.</p>
              <AddProductCard vendorId={vendorId} categories={categories} />
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))]">
              {products.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  vendorId={vendorId}
                  categories={categories}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              {pageToFetch > 1 && (
                <Link href={buildPageLink(pageToFetch - 1)}>
                  <Button variant="outline" size="sm"><ArrowLeft aria-hidden="true" /> Anterior</Button>
                </Link>
              )}
              <span className="text-sm text-[var(--muted)]">
                Página {pageToFetch} de {totalPages}
              </span>
              {pageToFetch < totalPages && (
                <Link href={buildPageLink(pageToFetch + 1)}>
                  <Button variant="outline" size="sm">Siguiente <ArrowRight aria-hidden="true" /></Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
