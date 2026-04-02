'use server';

import { NextResponse } from 'next/server';
import { getUserSession } from '../../../../lib/auth/getSession';
import db from '../../../../db/index.js';

export async function POST(request, { params }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.user.vendorId !== params.vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, sku, description, categoryId } = body;
  if (!name || !sku) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existing = await db.Product.findOne({ where: { vendorId: params.vendorId, sku } });
  if (existing) {
    return NextResponse.json({ error: 'Product SKU exists' }, { status: 409 });
  }

  const product = await db.Product.create({ vendorId: params.vendorId, categoryId: categoryId || null, name, sku, description });
  return NextResponse.json({ product }, { status: 201 });
}
