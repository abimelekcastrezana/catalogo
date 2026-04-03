import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';

export async function POST(request, { params }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (session.user.vendorId !== params.vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, slug } = body;
  if (!name || !slug) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existing = await db.Category.findOne({ where: { vendorId: params.vendorId, slug } });
  if (existing) {
    return NextResponse.json({ error: 'Category slug exists' }, { status: 409 });
  }

  const category = await db.Category.create({ vendorId: params.vendorId, name, slug });
  return NextResponse.json({ category }, { status: 201 });
}
