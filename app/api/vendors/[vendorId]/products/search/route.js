import { NextResponse } from 'next/server';
import { Op } from 'sequelize';
import db from '@/db/index.js';
import { getPlan } from '@/app/lib/plans';
import { applyDiscount, discountFor } from '@/app/lib/pricing';
import { visibleProductIds } from '@/lib/plan-limits';

export async function GET(request, { params }) {
  const { vendorId: slug } = await params;
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';

  if (!q) return NextResponse.json({ products: [] });

  const vendor = await db.Vendor.findOne({ where: { slug } });
  if (!vendor) return NextResponse.json({ products: [] });

  const plan = getPlan(vendor.plan);
  const visibleIds = await visibleProductIds(vendor.id, plan);
  const products = await db.Product.findAll({
    where: {
      vendorId: vendor.id,
      isActive: true,
        ...(visibleIds ? { id: { [Op.in]: visibleIds } } : {}),
      name: { [Op.iLike]: `%${q}%` },
    },
    include: [{ model: db.ProductImage, order: [['position', 'ASC']], limit: 1 }],
    order: [['position', 'ASC']],
    limit: 6,
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      // Con descuento (solo planes con funciones completas) se muestra el precio que queda.
      price: plan.fullProductFeatures ? applyDiscount(p.price, discountFor(p)) : p.price,
      image: p.ProductImages?.[0]?.path || null,
    })),
  });
}
