import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';

export async function DELETE(request, { params }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { vendorId, categoryId } = await params;
  if (session.user.vendorId !== vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const category = await db.Category.findOne({ where: { id: categoryId, vendorId } });
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  await category.destroy();
  return NextResponse.json({ success: true }, { status: 200 });
}
