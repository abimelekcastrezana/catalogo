import { NextResponse } from 'next/server';
import { Op } from 'sequelize';
import db from '@/db/index.js';
import { getPlan } from '@/app/lib/plans';
import { visibleProductIds } from '@/lib/plan-limits';

export async function GET(request, { params }) {
  const { vendorId: slug } = await params;
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';

  if (!q) return NextResponse.json({ products: [] });

  const vendor = await db.Vendor.findOne({ where: { slug } });
  if (!vendor) return NextResponse.json({ products: [] });

  const visibleIds = await visibleProductIds(vendor.id, getPlan(vendor.plan));
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
      price: p.price,
      image: p.ProductImages?.[0]?.path || null,
    })),
  });
}
