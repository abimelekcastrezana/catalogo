import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';

export async function POST(request) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { vendorId, name, slug } = body;

  if (!vendorId || !name || !slug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const vendor = await db.Vendor.findByPk(vendorId);
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const existing = await db.Category.findOne({ where: { vendorId, slug } });
  if (existing) {
    return NextResponse.json({ error: 'Category slug exists for this vendor' }, { status: 409 });
  }

  try {
    const category = await db.Category.create({ vendorId, name, slug });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Admin category creation error:', error);
    return NextResponse.json({ error: 'Server error creating category' }, { status: 500 });
  }
}
