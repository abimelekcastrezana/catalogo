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
  const { name, slug } = body;
  if (!name || !slug) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existing = await db.Category.findOne({ where: { vendorId: resolvedParams.vendorId, slug } });
  if (existing) {
    return NextResponse.json({ error: 'Category slug exists' }, { status: 409 });
  }

  try {
    const category = await db.Category.create({ vendorId: resolvedParams.vendorId, name, slug });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return NextResponse.json({ error: 'Category slug exists' }, { status: 409 });
    }
    console.error('Category creation error:', error);
    return NextResponse.json({ error: 'Server error creating category' }, { status: 500 });
  }
}
