import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import { UniqueConstraintError } from 'sequelize';
import db from '@/db/index.js';

export async function POST(request, { params }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  if (session.user.vendorId !== resolvedParams.vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, sku, description, categoryId, price } = body;
  if (!name || !sku || price === undefined || price === null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const vendorId = resolvedParams.vendorId;
  const normalizedSku = sku.trim();
  const normalizedPrice = Number(price);
  if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
    return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
  }
  const existing = await db.Product.findOne({ where: { vendorId, sku: normalizedSku } });
  if (existing) {
    return NextResponse.json({ error: 'SKU already exists for this vendor' }, { status: 409 });
  }

  try {
    const product = await db.Product.create({ vendorId, categoryId: categoryId || null, name, sku: normalizedSku, description, price: normalizedPrice });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return NextResponse.json({ error: 'SKU already exists for this vendor' }, { status: 409 });
    }
    console.error('Product create error:', error);
    return NextResponse.json({ error: 'Server error creating product' }, { status: 500 });
  }
}
