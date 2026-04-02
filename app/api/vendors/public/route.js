'use server';

import db from '../../../../db/index.js';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const vendor = await db.Vendor.findOne({ where: { slug: params.slug } });
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

  const categories = await db.Category.findAll({ where: { vendorId: vendor.id } });
  const products = await db.Product.findAll({ where: { vendorId: vendor.id, isActive: true } });

  return NextResponse.json({ vendor, categories, products });
}
