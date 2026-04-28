import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';

export async function PATCH(request, { params }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const resolvedParams = await params;
  const body = await request.json();
  const { ids } = body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Missing or invalid ids array' }, { status: 400 });
  }

  try {
    const products = await db.Product.findAll({ where: { vendorId: resolvedParams.vendorId } });
    const productIds = new Set(products.map(p => p.id));

    for (const id of ids) {
      if (!productIds.has(id)) {
        return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
      }
    }

    for (let i = 0; i < ids.length; i++) {
      await db.Product.update({ position: i }, { where: { id: ids[i] } });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Admin product reorder error:', error);
    return NextResponse.json({ error: 'Server error reordering products' }, { status: 500 });
  }
}
